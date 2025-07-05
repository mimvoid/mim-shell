import GObject, { register, getter, setter } from "ags/gobject";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

@register({ GTypeName: "Trash" })
export default class Trash extends GObject.Object {
  static instance: Trash;

  static readonly trashDirectory = GLib.get_user_data_dir() + "/Trash/files";
  protected static trashFile = Gio.File.new_for_path(Trash.trashDirectory);

  #monitor: Gio.FileMonitor | null = null;

  #diskUsage = 0;
  #fileCount = 0;
  #iconName = "user-trash-symbolic";

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
    } catch (err) {
      console.error(err);
    }

    try {
      this.#monitor = Trash.trashFile.monitor_directory(
        Gio.FileMonitorFlags.WATCH_MOVES,
        null,
      );
      this.#monitor.connect("changed", (_, file, otherFile, event) => {
        try {
          switch (event) {
            case Gio.FileMonitorEvent.MOVED_OUT:
              this.fileCount--;
              if (otherFile) {
                this.diskUsage -= otherFile.measure_disk_usage(
                  Gio.FileMeasureFlags.APPARENT_SIZE,
                  null,
                  null,
                )[1];
              } else {
                // The file was probably deleted, which means we can't
                // measure its size
                this.diskUsage = this.measureTrash()[0];
              }
              break;
            case Gio.FileMonitorEvent.MOVED_IN:
              this.fileCount++;
              this.diskUsage += file.measure_disk_usage(
                Gio.FileMeasureFlags.APPARENT_SIZE,
                null,
                null,
              )[1];
              break;
            default:
              break;
          }
        } catch (err) {
          console.error(err);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  @getter(Number)
  get diskUsage() {
    return this.#diskUsage;
  }

  @setter(Number)
  protected set diskUsage(size: number) {
    this.#diskUsage = size;
    this.notify("disk-usage");
  }

  @getter(Number)
  get fileCount() {
    return this.#fileCount;
  }

  @setter(Number)
  protected set fileCount(count: number) {
    this.#fileCount = count;
    this.notify("file-count");
  }

  @getter(String)
  get iconName() {
    return this.#iconName;
  }

  @setter(String)
  protected set iconName(icon: string) {
    this.#iconName = icon;
    this.notify("icon");
  }

  protected measureTrash() {
    const [_, ...data] = Trash.trashFile.measure_disk_usage(
      Gio.FileMeasureFlags.APPARENT_SIZE,
      null,
      null,
    );
    return data;
  }
}
