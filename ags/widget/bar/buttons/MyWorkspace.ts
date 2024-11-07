import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import { Box, Label, Button } from 'resource:///com/github/Aylur/ags/widget.js';
import { execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
import PanelButton from "../PanelButton"

// generate an array [1..10] then make buttons from the index
const arr = Array.from({ length: 10 }, (_, i) => i + 1);
const inActiveIcons = [
    "",
    "",
    "",
    "",
    "",
    '',
    '',
    '',
    '',
    '',
];
const activeIcons = [
    "",
    "",
    "",
    "",
    "",
    '',
    '',
    '',
    '',
    '',
];

export default (monitor: number) =>
    Box({
        className: 'myworkspaces',
    }).hook(Hyprland, (box) => {
        box.children = arr
            .filter(i => Hyprland.active.workspace.id == i || Hyprland.workspaces.find((item) => item.id === i))
            .map((i) =>
                PanelButton({
                    onClicked: () => execAsync(`hyprctl dispatch workspace ${i}`),
                    child: Label({
                        label:
                        Hyprland.active.workspace.id == i
                            ? activeIcons[i - 1]
                            : inActiveIcons[i - 1],
                    }),
                    className:
                    Hyprland.active.workspace.id == i && Hyprland.active.monitor.id == monitor
                        ? 'active'
                        : Hyprland.workspaces.find((item) => item.id === i)?.windows || 0 > 0
                            ? 'inactive has-windows'
                            : 'inactive',
                })
            );
    });
