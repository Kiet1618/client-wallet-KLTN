function getWindow(): Window {
    if (typeof window !== "undefined") return window;
}

const win = getWindow();

export const deviceInfo = () => {
    // Get information about the browser
    try {
        const userAgent = win.navigator.userAgent;
        const browserName = getBrowserName(userAgent);
        const browserVersion = getBrowserVersion(userAgent);
        const osName = getOSName(userAgent);

        return `${browserName}-${browserVersion}-${osName}`
    } catch (error) {
        return "";
    }
}

function getBrowserName(userAgent: string) {
    const browsers = {
        Chrome: /Chrome\/(\d+)/,
        Firefox: /Firefox\/(\d+)/,
        IE: /Trident\/(\d+)/,
        Edge: /Edge\/(\d+)/,
        Safari: /Safari\//,
        Opera: /Opera\//
    };

    for (const browser in browsers) {
        if (userAgent.match(browsers[browser])) {
            return browser;
        }
    }

    return 'Unknown';
}

function getBrowserVersion(userAgent: string) {
    const matches = userAgent.match(/(Chrome\/|Firefox\/|Trident\/|Edge\/|Safari\/|Opera\/)(\d+)/);

    if (matches && matches.length >= 3) {
        return matches[2];
    }

    return 'Unknown';
}

function getOSName(userAgent: string) {
    const osList = {
        'Windows 10': /Windows NT 10.0/,
        'Windows 8.1': /Windows NT 6.3/,
        'Windows 8': /Windows NT 6.2/,
        'Windows 7': /Windows NT 6.1/,
        'Windows Vista': /Windows NT 6.0/,
        'Windows XP': /Windows NT 5.1/,
        'macOS Monterey': /macOS 12/,
        'macOS Big Sur': /macOS 11/,
        'macOS Catalina': /macOS 10.15/,
        'macOS Mojave': /macOS 10.14/,
        'macOS High Sierra': /macOS 10.13/,
        'macOS Sierra': /macOS 10.12/,
        'Mac OS X El Capitan': /Mac OS X 10_11/,
        'Mac OS X Yosemite': /Mac OS X 10_10/,
        'Mac OS X Mavericks': /Mac OS X 10_9/,
        'Mac OS X Mountain Lion': /Mac OS X 10_8/,
        'Mac OS X Lion': /Mac OS X 10_7/,
        'Mac OS X Snow Leopard': /Mac OS X 10_6/,
        'Mac OS': /Mac OS X/,
        'Linux': /Linux/,
        'Unknown': /./
    };

    for (const os in osList) {
        if (userAgent.match(osList[os])) {
            return os;
        }
    }

    return 'Unknown';
}