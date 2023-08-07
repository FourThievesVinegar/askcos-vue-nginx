/*
 * Color utility functions
 */

const colorMap = [
    '#EE7733',
    '#0077BB',
    '#33BBEE',
    '#EE3377',
    '#CC3311',
    '#009988',
    '#BBBBBB',
]

function interpolateHexColor(palette, value) {
    // Interpolate between colors in palette at the specified value
    // Palette colors should be arrays of rgb hex strings
    palette = palette.map(color => hex2rgb(color))
    return rgb2hex(interpolateColor(palette, value))
}

function interpolateColor(palette, value) {
    // Interpolate between colors in palette at the specified value
    // Palette colors should be arrays of rgb decimal values
    if (value === 0) {
        return palette[0]
    } else if (value === 1) {
        return palette[palette.length - 1]
    } else if (value < 0 || value > 1) {
        throw 'Value should be between 0 and 1!'
    }

    const interval = 1 / (palette.length - 1)
    const start = Math.floor(value / interval)
    const end = start + 1
    const startColor = palette[start]
    const endColor = palette[end]
    const x = [start * interval, end * interval]

    const newColor = []
    for (let i = 0; i < 3; i++) {
        const y = [startColor[i], endColor[i]]
        newColor.push(Math.floor(interpolate(x, y, value)))
    }
    return newColor
}

function interpolate(x, y, xn) {
    // x is array of 2 x values
    // y is array of 2 y values
    // xn is the new x for which to determine the value of y
    return y[0] + (xn - x[0]) * (y[1] - y[0]) / (x[1] - x[0])
}

function hex2rgb(rgb) {
    // Converts rgb hex string to decimal values
    rgb = rgb.replace('#', '')
    if (rgb.length === 6) {
        return [0, 2, 4].map(i => parseInt(rgb.slice(i, i + 2), 16))
    } else {
        throw 'Only 6 character color hex strings supported!'
    }
}

function rgb2hex(num) {
    // Converts array of rgb decimal values to hex string
    if (num.length === 3) {
        return '#' + num.map(i => {
            let hex = i.toString(16)
            return ('00' + hex).substr(hex.length)
        }).join('')
    } else {
        throw 'Only three element rgb values supported!'
    }
}

export {colorMap, interpolateHexColor};
