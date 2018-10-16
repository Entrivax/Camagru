class StringHelpers {
    trimStart(character: string, string: string) : string {
        var startIndex = 0;
    
        while (string[startIndex] === character) {
            startIndex++;
        }
    
        return string.substr(startIndex);
    }

    parseMySqlDate(date: string) : Date {
        let split = date.split(/[- :]/);
        return new Date(Date.UTC(+split[0], +split[1] - 1, +split[2], +split[3] || 0, +split[4] || 0, +split[5] || 0));
    }

    getTimeDiff(from: Date, to: Date) : string {
        let elapsed = (to.getTime() - from.getTime()) / 1000;
        let years = elapsed / 31557600;
        if (years >= 1) {
            return Math.trunc(years) + ' year' + (years >= 2 ? 's' : '');
        }
        let months = elapsed / 2629800;
        if (months >= 1) {
            return Math.trunc(months) + ' month' + (months >= 2 ? 's' : '');
        }
        let days = elapsed / 86400;
        if (days >= 1) {
            return Math.trunc(days) + ' day' + (days >= 2 ? 's' : '');
        }
        let hours = elapsed / 3600;
        if (hours >= 1) {
            return Math.trunc(hours) + ' hour' + (hours >= 2 ? 's' : '');
        }
        let minutes = elapsed / 60;
        if (minutes >= 1) {
            return Math.trunc(minutes) + ' minute' + (minutes >= 2 ? 's' : '');
        }
        let seconds = elapsed;
        return Math.trunc(seconds) + ' second' + (seconds >= 2 ? 's' : '');
    }

    escapeHtml(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}