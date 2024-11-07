import "lib/session"
import "lib/init"
import "style/style"
import options from "options"
import Bar from "widget/bar/Bar"
import Launcher from "widget/launcher/Launcher"
import NotificationPopups from "widget/notifications/NotificationPopups"
import OSD from "widget/osd/OSD"
import Overview from "widget/overview/Overview"
import PowerMenu from "widget/powermenu/PowerMenu"
import ScreenCorners from "widget/bar/ScreenCorners"
import SettingsDialog from "widget/settings/SettingsDialog"
import Verification from "widget/powermenu/Verification"
import { forMonitors, getMonitors } from "lib/utils"
import { setupQuickSettings } from "widget/quicksettings/QuickSettings"
import { setupDateMenu } from "widget/datemenu/DateMenu"

const hyprland = await Service.import('hyprland')

App.config({
    onConfigParsed: () => {
        setupQuickSettings()
        setupDateMenu()

        var monitorSize = getMonitors().length
        Utils.watch(null, hyprland, "monitor-added", () => {
            App.addWindow(Bar(monitorSize))
            App.addWindow(NotificationPopups(monitorSize))
            App.addWindow(ScreenCorners(monitorSize))
            App.addWindow(OSD(monitorSize))
            monitorSize++
        })
        Utils.watch(null, hyprland, "monitor-removed", () => {
            monitorSize--
            App.removeWindow(App.getWindow(`bar${monitorSize}`))
            App.removeWindow(App.getWindow(`notifications${monitorSize}`))
            App.removeWindow(App.getWindow(`corner${monitorSize}`))
            App.removeWindow(App.getWindow(`indicator${monitorSize}`))
        })
    },
    closeWindowDelay: {
        "launcher": options.transition.value,
        "overview": options.transition.value,
        "quicksettings": options.transition.value,
        "datemenu": options.transition.value,
    },
    windows: () => [
        ...forMonitors(Bar),
        ...forMonitors(NotificationPopups),
        ...forMonitors(ScreenCorners),
        ...forMonitors(OSD),
        Launcher(),
        Overview(),
        PowerMenu(),
        SettingsDialog(),
        Verification(),
    ],
})
