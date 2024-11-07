import PanelButton from "../PanelButton"
import { bash } from "lib/utils"

export default () => {
    const label_icon = Widget.Label({
        class_name:"label-icon",
        label: '',
    });
    const label = Widget.Label({
        label: '',
    });
    return PanelButton({
        class_name: "cpu",
        on_clicked: () => {bash('term-float htop')},
        child: Widget.Box({
            children: [label_icon, label],
        }).poll(2000, self => {
            bash(`$HOME/.config/ags/script/cpu.sh`)
                .then((val) => {
                    label.label = Number(val).toFixed(0) + "%"
                    label.tooltipMarkup = `<span weight='bold' foreground='#FDC227'>${val}%</span>`;
                })
                .catch(print);
        }),
    })
}
