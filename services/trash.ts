import GObject, { register, getter, setter } from "ags/gobject";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

@register({ GTypeName: "Trash" })
export default class Trash extends GObject.Object {
  static instance: Trash;

  static readonly trashDirectory = GLib.get_user_data_dir() + "/Trash/files";
  protected static trashFile = Gio.File.new_for_path(Trash.trashDirectory);

  // Keep a reference to the directory file monitor
  #moveMonitor: Gio.FileMonitor | null = null;

  #diskUsage = 0;
  #fileCount = 0;
  #iconName: string;

  static get_default() {
    if (!this.instance) this.instance = new Trash();
    return this.instance;
  }

  constructor() {
    super();

    try {
      const [diskUsage, _, fileCount] = this.measureTrash();
      this.#diskUsage = diskUsage;
      this.#fileCount = fileCount;

      this.#moveMonitor = Trash.trashFile.monitor_directory(
        Gio.FileMonitorFlags.WATCH_MOVES,
        null,
      );
    } catch (err) {
      console.error(err);
    }

    this.#iconName =
      this.#fileCount === 0
        ? "user-trash-symbolic"
        : "user-trash-full-symbolic";

    this.#moveMonitor?.connect("changed", async (_, file, otherFile, event) => {
      switch (event) {
        case Gio.FileMonitorEvent.MOVED_OUT:
          if (--this.fileCount === 0) {
            this.iconName = "user-trash-symbolic";
          }
          try {
            if (otherFile) {
              this.diskUsage -= otherFile.measure_disk_usage(
                Gio.FileMeasureFlags.APPARENT_SIZE,
                null,
                null,
              )[1];
            } else {
              // The file was likely deleted, so we can't measure its size
              this.diskUsage = this.measureTrash()[0];
            }
          } catch (err) {
            console.error(err);
          }
          break;
        case Gio.FileMonitorEvent.MOVED_IN:
          if (this.fileCount++ === 0) {
            this.iconName = "user-trash-full-symbolic";
          }
          try {
            this.diskUsage += file.measure_disk_usage(
              Gio.FileMeasureFlags.APPARENT_SIZE,
              null,
              null,
            )[1];
          } catch (err) {
            console.error(err);
          }
        default:
          break;
      }
    });
  }

  // The size of the trash directory in bytes
  @getter({ $gtype: GObject.TYPE_UINT })
  get diskUsage() {
    return this.#diskUsage;
  }

  @setter({ $gtype: GObject.TYPE_UINT })
  protected set diskUsage(size: number) {
    this.#diskUsage = size;
    this.notify("disk-usage");
  }

  // The number of files in the trash
  @getter({ $gtype: GObject.TYPE_UINT })
  get fileCount() {
    return this.#fileCount;
  }

  @setter({ $gtype: GObject.TYPE_UINT })
  protected set fileCount(count: number) {
    this.#fileCount = count;
    this.notify("file-count");
  }

  // An icon based on the number of files in trash
  @getter(String)
  get iconName() {
    return this.#iconName;
  }

  @setter(String)
  protected set iconName(icon: string) {
    this.#iconName = icon;
    this.notify("icon-name");
  }

  /**
   * Measures the disk usage of the trash directory.
   * May throw an error.
   *
   * @returns The disk usage, number of directories, and number of files
   */
  protected measureTrash() {
    const [_, ...data] = Trash.trashFile.measure_disk_usage(
      Gio.FileMeasureFlags.APPARENT_SIZE,
      null,
      null,
    );
    return data;
  }
}
