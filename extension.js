
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const SETTINGS_LOCK_URI = 'picture-uri';

const FOLDER_CONTAINING_PICTURES = '/home/masm/Pictures/screensaver';
const TIMER_MSEC = 5000;

let _timerId = -1;

function _selectPicture() {
    try {
	let dir = Gio.File.new_for_path(FOLDER_CONTAINING_PICTURES);
	let files = dir.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
	
	if (files !== null) {
	    let info;
	    let filenames = [];
	    while ((info = files.next_file(null)) != null) {
		let child = files.get_child(info);
		if (info.get_file_type() == Gio.FileType.REGULAR)
		    filenames.push(child.get_parse_name());
	    }
	    
	    if (filenames.length >= 1) {
		let idx = Math.floor(Math.random() * filenames.length);
		// log(filenames[idx]);
		return filenames[idx];
	    }
	}
    } catch (e) {
	log(e);
    }
    
    return null;
}

function _changePicture() {
    try {
	let path = _selectPicture();
	
	if (path != null) {
	    let setting = new Gio.Settings({schema: 'org.gnome.desktop.screensaver'});
	    setting.set_string(SETTINGS_LOCK_URI,
			       'file://' + path.split('/').map(c => encodeURIComponent(c)).join('/'));
	}
    } catch (e) {
	log(e);
    }
    
    return true;
}

function _startTimer() {
    _stopTimer();
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, TIMER_MSEC, _changePicture);
}

function _stopTimer() {
    if (_timerId >= 0) {
	GLib.source_remove(_timerId);
	_timerId = -1;
    }
}

function init() {
    log("slidelocker: init.");
    /* 画面を lock すると disable が実行されてしまうので、
     * init 時に呼び、stop しない。
     */
    _startTimer();
}

function enable() {
    log("slidelocker: enable.");
}

function disable() {
    log("slidelocker: disable.");
}
