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

export function searchOneApp(apps: Application[], term: string) {
    const priorities = [
        'wm-class', 'name', 'desktop', 'icon_name', 'description', 'executable'
    ];

    for (const key of priorities) {
        for (const app of apps) {
            if (_match(app[key], term)) {
                return app;
            }
        }
    }

    return null;
}
