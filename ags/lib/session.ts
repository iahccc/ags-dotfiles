import GLib from "gi://GLib?version=2.0"

declare global {
    const OPTIONS: string
    const MATERIAL: string
    const TMP: string
    const USER: string
}

Object.assign(globalThis, {
    OPTIONS: `${GLib.get_user_cache_dir()}/ags/options.json`,
    MATERIAL: `${GLib.get_user_cache_dir()}/ags/gtk.css`,
    TMP: `${GLib.get_tmp_dir()}/asztal`,
    USER: GLib.get_user_name(),
})

Utils.ensureDirectory(TMP)
App.addIcons(`${App.configDir}/assets`)
