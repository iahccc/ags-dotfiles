import { type Application } from "types/service/applications"
import { launchApp, icon } from "lib/utils"
import options from "options"
import icons from "lib/icons"
import Window from "widget/overview/Window"
const { Gdk, Gtk } = imports.gi;
import { opt } from "lib/option"

const apps = await Service.import("applications")
const { query } = apps
const { iconSize, favorites } = options.launcher.apps
const TARGET = [Gtk.TargetEntry.new('text/plain', Gtk.TargetFlags.SAME_APP, 0)];

export const newFavFlag = opt(false)

const QuickAppButton = (app: Application) => Widget.Button({
    hexpand: true,
    tooltip_text: app.name,
    on_clicked: (widget) => {
        App.closeWindow("launcher")
        launchApp(app)
    },
    on_middle_click: () => {
        favorites.setValue(favorites.getValue().map(arr => arr.filter(item => item != app.desktop)).filter(arr => arr.length > 0))
    },
    child: Widget.Icon({
        size: iconSize.bind(),
        icon: icon(app.icon_name, icons.fallback.executable),
    }),
    setup: (button) => {
        button.drag_source_set(Gdk.ModifierType.BUTTON1_MASK, TARGET, Gdk.DragAction.MOVE);
        button.drag_source_set_icon_name(icon(app.icon_name, icons.fallback.executable));

        button.connect('drag-begin', (button) => {
            button.toggleClassName('overview-tasks-window-dragging', true);
        });
        button.connect('drag-data-get', (_w, _c, data) => {
            data.set_text(app.desktop, app.desktop?.length || 0);
            button.toggleClassName('overview-tasks-window-dragging', false);
        });
    }
})

const AppItem = (app: Application) => {
    const title = Widget.Label({
        class_name: "title",
        label: app.name,
        hexpand: true,
        xalign: 0,
        vpack: "center",
        truncate: "end",
    })

    const description = Widget.Label({
        class_name: "description",
        label: app.description || "",
        hexpand: true,
        wrap: true,
        max_width_chars: 30,
        xalign: 0,
        justification: "left",
        vpack: "center",
    })

    const appicon = Widget.Icon({
        icon: icon(app.icon_name, icons.fallback.executable),
        size: iconSize.bind(),
    })

    const textBox = Widget.Box({
        vertical: true,
        vpack: "center",
        children: app.description ? [title, description] : [title],
    })

    return Widget.Button({
        class_name: "app-item",
        attribute: { app },
        child: Widget.Box({
            children: [appicon, textBox],
        }),
        on_clicked: () => {
            App.closeWindow("launcher")
            launchApp(app)
        },
        on_middle_click: (widget, event) => {
            let favs = favorites.getValue()
            favs[favs.length - 1].push(app.desktop || "")
            favorites.setValue(favs)
            newFavFlag.setValue(true)
        }
    })
}

const fixed = Widget.Box({
    attribute: {
        put: (widget, x, y) => {
            if (!widget.attribute) return;
            // Note: x and y are already multiplied by userOptions.overview.scale
            const newCss = `
                        margin-left: ${Math.round(x)}px;
                        margin-top: ${Math.round(y)}px;
                        margin-right: -${Math.round(x + (widget.attribute.w))}px;
                        margin-bottom: -${Math.round(y + (widget.attribute.h))}px;
                    `;
            widget.css = newCss;
            fixed.pack_start(widget, false, false, 0);
        },
        move: (widget, x, y) => {
            if (!widget) return;
            if (!widget.attribute) return;
            // Note: x and y are already multiplied by userOptions.overview.scale
            const newCss = `
                        margin-left: ${Math.round(x)}px;
                        margin-top: ${Math.round(y)}px;
                        margin-right: -${Math.round(x + (widget.attribute.w))}px;
                        margin-bottom: -${Math.round(y + (widget.attribute.h))}px;
                    `;
            widget.css = newCss;
        },
    }
})

export function Favorites() {
    const favs = options.launcher.apps.favorites.bind()
    return Widget.Revealer({
        visible: favs.as(f => f.length > 0),
        reveal_child: newFavFlag.bind(),
        child: Widget.Box({
            vertical: true,
            children: favs.as(favs => favs.flatMap(fs => [
                Widget.Separator(),
                Widget.Box({
                    class_name: "quicklaunch horizontal",
                    homogeneous: true,
                    setup: (self) => {
                        self.drag_dest_set(Gtk.DestDefaults.ALL, TARGET, Gdk.DragAction.MOVE);
                        self.connect('drag-data-received', (_w, _c, _x, _y, data) => {
                            let box = _w
                            let parentBox = box.get_parent()
                            let indexInParentBox = parentBox?.get_children().indexOf(box)
                            let width = box.get_allocated_width()
                            let column = box.get_children().length
                            let buttonWidth = width / column
                            let c = Math.floor((_x + buttonWidth / 2) / buttonWidth)
                            let r = indexInParentBox / 2 - 1

                            let favs = favorites.getValue()
                            favs = favs.map(arr => arr.filter(item => item !== data.get_text()))
                            favs[r].splice(c, 0, data.get_text())
                            favorites.setValue(favs.filter(arr => arr.length > 0))
                        });
                    },
                    children: fs.map(f => {
                        let app = query(f)?.[0]
                        if (app === undefined) {
                            favorites.setValue(favorites.getValue().map(arr => arr.filter(item => item != f)))
                        }
                        return app
                    })
                        .filter(f => f)
                        .map(QuickAppButton)
                }),
            ])).as(arr => [
                Widget.Box({
                    class_name: "quicklaunch horizontal",
                    homogeneous: true,
                    height_request:5,
                    setup: (self) => {
                        self.drag_dest_set(Gtk.DestDefaults.ALL, TARGET, Gdk.DragAction.MOVE);
                        self.connect('drag-data-received', (_w, _c, _x, _y, data) => {
                            let favs = favorites.getValue()
                            favs = favs.map(arr => arr.filter(item => item !== data.get_text()))
                            favs.unshift([])
                            favs[0][0] = data.get_text()
                            favorites.setValue(favs.filter(arr => arr.length > 0))
                        });
                    }
                }),
                ...arr,
                Widget.Separator(),
                Widget.Box({
                    class_name: "quicklaunch horizontal",
                    homogeneous: true,
                    height_request:5,
                    setup: (self) => {
                        self.drag_dest_set(Gtk.DestDefaults.ALL, TARGET, Gdk.DragAction.MOVE);
                        self.connect('drag-data-received', (_w, _c, _x, _y, data) => {
                            let box = _w
                            let parentBox = box.get_parent()
                            let indexInParentBox = parentBox?.get_children().indexOf(box)
                            let r = indexInParentBox / 2 - 1

                            let favs = favorites.getValue()
                            favs = favs.map(arr => arr.filter(item => item !== data.get_text()))
                            favs.push([])
                            favs[r][0] = data.get_text()
                            favorites.setValue(favs.filter(arr => arr.length > 0))
                        });
                    }
            })]),
        }),
    })
}

export function Launcher() {
    const applist = Variable(query(""))
    const max = options.launcher.apps.max
    let first = applist.value[0]

    function SeparatedAppItem(app: Application) {
        return Widget.Revealer(
            { attribute: { app } },
            Widget.Box(
                { vertical: true },
                Widget.Separator(),
                AppItem(app),
            ),
        )
    }

    const list = Widget.Box({
        vertical: true,
        children: applist.bind().as(list => list.map(SeparatedAppItem)),
        setup: self => self
            .hook(apps, () => applist.value = query(""), "changed"),
    })

    return Object.assign(list, {
        filter(text: string | null) {
            first = query(text || "")[0]
            list.children.reduce((i, item) => {
                if (!text || i >= max.value) {
                    item.reveal_child = false
                    return i
                }
                if (item.attribute.app.match(text)) {
                    item.reveal_child = true
                    return ++i
                }
                item.reveal_child = false
                return i
            }, 0)
        },
        launchFirst() {
            launchApp(first)
        },
    })
}
