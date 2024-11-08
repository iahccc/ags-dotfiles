import Gio from "gi://Gio"
import options from "options"

const settings = new Gio.Settings({
    schema: "org.gnome.desktop.interface",
})

function gtk() {
    const scheme = options.theme.scheme.value
    settings.set_string("gtk-theme", `Adwaita`)
    settings.set_string("gtk-theme", `Material`)
    settings.set_string("color-scheme", `prefer-${scheme}`)
}

function getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

async function genCss() {
    const scheme = options.theme.scheme.value
    // Material css 生成
    Utils.readFileAsync(`${App.configDir}/lib/templates/gtk.css`)
        .then((templateContent) => {
            let gtkCss = templateContent;

            for (const opt of options.array()) {
                let prefix = `theme.${scheme}.`
                if ([`theme.${scheme}`].some(i => opt.id.startsWith(i))) {
                    const placeholder = `{{ ${opt.id.replace(prefix, "")} }}`;
                    gtkCss = gtkCss.replace(new RegExp(placeholder, 'g'), getValueByPath(options, opt.id));
                }
            }
            return Utils.writeFile(gtkCss, MATERIAL);
        })
        .then((file) => {
            gtk()
        })
        .catch((err) => {
            console.error('Error:', err);
        });
}

export default function init() {
    options.theme.scheme.connect("changed", gtk)
    gtk()
    options.handler(["theme"], genCss)
}
