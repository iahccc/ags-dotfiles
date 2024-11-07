import PanelButton from "../PanelButton"
import prompter from "service/prompter"

export default () => PanelButton({
    class_name: "prompter",
    visible: prompter.bind("content").as(content => content.length !== 0),
    child: Widget.Box({
        children: [
            Widget.Label({
                label: prompter.bind("content").as(content => `> ${content} <`),
            }),
        ],
    }),
})
