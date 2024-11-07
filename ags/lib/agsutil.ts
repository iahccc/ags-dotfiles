/**
 * 针对ags源码的一些重写方法
 */

export function _match(prop: string | null, search: string) {
    if (!prop)
        return false;

    if (!search)
        return true;

    return prop?.toLowerCase().includes(search.toLowerCase());
}

export function matchApp(app: Application, term: string) {
    const _match = (prop: string | null, search: string) => {
        if (!prop)
            return false;
        if (!search)
            return true;
        return prop?.toLowerCase().includes(search.toLowerCase());
    }

    const { name, desktop, description, executable, wm_class } = app;
    return _match(name, term) ||
        _match(wm_class, term) ||
        _match(desktop, term) ||
        _match(executable, term) ||
        _match(description, term);
};
