class Prompter extends Service {
    static {
        Service.register(this, {}, {
            "content": ["string"],
        })
    }

    content = ""

    async prompt(content: string = "") {
        this.content = content
        this.changed("content")
    }

    async clear() {
        this.content = ""
        this.changed("content")
    }
}

const prompter = new Prompter()
Object.assign(globalThis, { prompter })
export default prompter
