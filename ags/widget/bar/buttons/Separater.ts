import options from "options"

export default () => Widget.Label({
    class_name: "separater",
    label: "|",
    setup: self => {
        self.hook(options.bar.flatButtons, () => {
            if(!options.bar.flatButtons.value) {
                self.label = "";
            } else {
                self.label = "|";
            }
        })
    },
})
