/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Application } from "types/service/applications"
import icons, { substitutes } from "./icons"
import Gtk from "gi://Gtk?version=3.0"
import Gdk from "gi://Gdk"
import GLib from "gi://GLib?version=2.0"

export type Binding<T> = import("types/service").Binding<any, any, T>

/**
  * @returns substitute icon || name || fallback icon
  */
export function icon(name: string | null, fallback = icons.missing) {
    if (!name)
        return fallback || ""

    if (GLib.file_test(name, GLib.FileTest.EXISTS))
        return name

    const icon = (substitutes[name] || name)
    if (Utils.lookUpIcon(icon))
        return icon

    print(`no icon substitute "${icon}" for "${name}", fallback: "${fallback}"`)
    return fallback
}

/**
 * @returns execAsync(["bash", "-c", cmd])
 */
export async function bash(strings: TemplateStringsArray | string, ...values: unknown[]) {
    const cmd = typeof strings === "string" ? strings : strings
        .flatMap((str, i) => str + `${values[i] ?? ""}`)
        .join("")

    return Utils.execAsync(["bash", "-c", cmd]).catch(err => {
        console.error(cmd, err)
        return ""
    })
}

/**
 * @returns execAsync(cmd)
 */
export async function sh(cmd: string | string[]) {
    return Utils.execAsync(cmd).catch(err => {
        console.error(typeof cmd === "string" ? cmd : cmd.join(" "), err)
        return ""
    })
}

export function forMonitors(widget: (monitor: number) => Gtk.Window) {
    const n = Gdk.Display.get_default()?.get_n_monitors() || 1
    return range(n, 0).map(widget).flat(1)
}

export function getMonitors() {
    const n = Gdk.Display.get_default()?.get_n_monitors() || 1
    return range(n, 0).flat(1)
}

/**
 * @returns [start...length]
 */
export function range(length: number, start = 1) {
    return Array.from({ length }, (_, i) => i + start)
}

/**
 * @returns true if all of the `bins` are found
 */
export function dependencies(...bins: string[]) {
    const missing = bins.filter(bin => {
        return !Utils.exec(`which ${bin}`)
    })

    if (missing.length > 0) {
        console.warn("missing dependencies:", missing.join(", "))
        Utils.notify(`missing dependencies: ${missing.join(", ")}`)
    }

    return missing.length === 0
}

/**
 * run app detached
 */
export function launchApp(app: Application) {
    const exe = app.executable
        .split(/\s+/)
        .filter(str => !str.startsWith("%") && !str.startsWith("@"))
        .join(" ")
    getFocusedMonitorScale().then(scale => {
        if(exe.includes("flatpak")) {
            bash(`flatpak override --env=GDK_SCALE=${scale} --env=QT_AUTO_SCREEN_SCALE_FACTOR=1 --env=QT_SCALE_FACTOR=${scale} --user`)
        }
        bash(`QT_AUTO_SCREEN_SCALE_FACTOR=1 && QT_SCALE_FACTOR=${scale} && GDK_SCALE=${scale} && ${exe} &`)
        app.frequency += 1
    })

}

/**
 * to use with drag and drop
 */
export function createSurfaceFromWidget(widget: Gtk.Widget) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cairo = imports.gi.cairo as any
    const alloc = widget.get_allocation()
    const surface = new cairo.ImageSurface(
        cairo.Format.ARGB32,
        alloc.width,
        alloc.height,
    )
    const cr = new cairo.Context(surface)
    cr.setSourceRGBA(255, 255, 255, 0)
    cr.rectangle(0, 0, alloc.width, alloc.height)
    cr.fill()
    widget.draw(cr)
    return surface
}

/**
 * debounce
 */
export function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

/**
 * get focused monitor scale
 */
export async function getFocusedMonitorScale() {
    const output = await bash(`hyprctl monitors -j`);
    const monitors = JSON.parse(output);
    const focusedMonitor = monitors.find(monitor => monitor.focused === true);
    return focusedMonitor ? focusedMonitor.scale : 1;
}
