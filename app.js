function detectBrowser() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let browserEngine = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
        browserEngine = 'Gecko';
    } else if (ua.indexOf('Edg') > -1) {
        browserName = 'Microsoft Edge';
        browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
        browserEngine = 'Blink';
    } else if (ua.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
        browserEngine = 'Blink';
    } else if (ua.indexOf('Safari') > -1) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
        browserEngine = 'WebKit';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
        browserName = 'Opera';
        browserVersion = ua.match(/(?:Opera|OPR)\/(\d+\.\d+)/)?.[1] || 'Unknown';
        browserEngine = 'Blink';
    }

    return { browserName, browserVersion, browserEngine };
}

function detectOS() {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    let osVersion = 'Unknown';

    if (ua.indexOf('Win') > -1) {
        os = 'Windows';
        if (ua.indexOf('Windows NT 10.0') > -1) osVersion = '10/11';
        else if (ua.indexOf('Windows NT 6.3') > -1) osVersion = '8.1';
        else if (ua.indexOf('Windows NT 6.2') > -1) osVersion = '8';
        else if (ua.indexOf('Windows NT 6.1') > -1) osVersion = '7';
    } else if (ua.indexOf('Mac') > -1) {
        os = 'macOS';
        const match = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
        if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (ua.indexOf('Linux') > -1) {
        os = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
        os = 'Android';
        const match = ua.match(/Android (\d+\.\d+)/);
        if (match) osVersion = match[1];
    } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
        os = 'iOS';
        const match = ua.match(/OS (\d+_\d+)/);
        if (match) osVersion = match[1].replace(/_/g, '.');
    }

    return { os, osVersion };
}

function detectDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return '平板电脑';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return '手机';
    }
    return '桌面电脑';
}

async function getIPInfo() {
    const apis = [
        {
            url: 'https://ipwho.is/',
            parser: async (data) => ({
                ip: data.ip,
                isp: data.connection?.isp || '无法获取',
                country: data.country,
                region: data.region,
                city: data.city,
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone?.id || '无法获取',
                postal: data.postal || '无法获取'
            })
        },
        {
            url: 'https://ipapi.co/json/',
            parser: async (data) => ({
                ip: data.ip,
                isp: data.org,
                country: data.country_name,
                region: data.region,
                city: data.city,
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone,
                postal: data.postal
            })
        },
        {
            url: 'https://api.ipgeolocation.io/ipgeo?apiKey=free',
            parser: async (data) => ({
                ip: data.ip,
                isp: data.isp || '无法获取',
                country: data.country_name,
                region: data.state_prov,
                city: data.city,
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.time_zone?.name || '无法获取',
                postal: data.zipcode || '无法获取'
            })
        },
        {
            url: 'https://freeipapi.com/api/json',
            parser: async (data) => ({
                ip: data.ipAddress,
                isp: '无法获取',
                country: data.countryName,
                region: data.regionName,
                city: data.cityName,
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timeZone || '无法获取',
                postal: data.zipCode || '无法获取'
            })
        }
    ];

    for (const api of apis) {
        try {
            const response = await fetch(api.url);
            const rawData = await response.json();
            const data = await api.parser(rawData);
            
            document.getElementById('ip-address').textContent = data.ip || '无法获取';
            document.getElementById('isp').textContent = data.isp || '无法获取';
            document.getElementById('country').textContent = data.country || '无法获取';
            document.getElementById('region').textContent = data.region || '无法获取';
            document.getElementById('city').textContent = data.city || '无法获取';
            document.getElementById('latitude').textContent = data.latitude || '无法获取';
            document.getElementById('longitude').textContent = data.longitude || '无法获取';
            document.getElementById('timezone').textContent = data.timezone || '无法获取';
            document.getElementById('postal').textContent = data.postal || '无法获取';
            
            document.querySelectorAll('#ip-address, #isp, #country, #region, #city, #latitude, #longitude, #timezone, #postal').forEach(el => {
                el.classList.remove('loading');
            });
            
            return;
        } catch (error) {
            console.warn(`API ${api.url} 失败，尝试下一个...`, error);
            continue;
        }
    }
    
    document.getElementById('ip-address').textContent = '所有API均获取失败';
    document.getElementById('isp').textContent = '获取失败';
    document.getElementById('country').textContent = '获取失败';
    document.getElementById('region').textContent = '获取失败';
    document.getElementById('city').textContent = '获取失败';
    document.getElementById('latitude').textContent = '获取失败';
    document.getElementById('longitude').textContent = '获取失败';
    document.getElementById('timezone').textContent = '获取失败';
    document.getElementById('postal').textContent = '获取失败';
}

function getGPSLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('accuracy').textContent = `${position.coords.accuracy.toFixed(2)} 米`;
                document.getElementById('accuracy').classList.remove('loading');
            },
            (error) => {
                document.getElementById('accuracy').textContent = '用户拒绝或不可用';
                document.getElementById('accuracy').classList.remove('loading');
            }
        );
    } else {
        document.getElementById('accuracy').textContent = '不支持';
        document.getElementById('accuracy').classList.remove('loading');
    }
}

function getDeviceInfo() {
    const { os, osVersion } = detectOS();
    const deviceType = detectDeviceType();
    
    document.getElementById('device-type').textContent = deviceType;
    document.getElementById('os').textContent = os;
    document.getElementById('os-version').textContent = osVersion;
    document.getElementById('screen-resolution').textContent = `${screen.width} × ${screen.height}`;
    document.getElementById('color-depth').textContent = `${screen.colorDepth} 位`;
    document.getElementById('pixel-ratio').textContent = window.devicePixelRatio || '1';
}

function getBrowserInfo() {
    const { browserName, browserVersion, browserEngine } = detectBrowser();
    
    document.getElementById('browser-name').textContent = browserName;
    document.getElementById('browser-version').textContent = browserVersion;
    document.getElementById('browser-engine').textContent = browserEngine;
    document.getElementById('language').textContent = navigator.language || '无法获取';
    document.getElementById('cookies-enabled').textContent = navigator.cookieEnabled ? '已启用' : '已禁用';
    document.getElementById('online-status').textContent = navigator.onLine ? '在线' : '离线';
}

function getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
        document.getElementById('connection-type').textContent = connection.type || connection.effectiveType || '无法获取';
        document.getElementById('effective-type').textContent = connection.effectiveType || '无法获取';
        document.getElementById('downlink').textContent = connection.downlink ? `${connection.downlink} Mbps` : '无法获取';
        document.getElementById('rtt').textContent = connection.rtt ? `${connection.rtt} ms` : '无法获取';
        document.getElementById('save-data').textContent = connection.saveData ? '已启用' : '未启用';
    } else {
        document.getElementById('connection-type').textContent = '不支持';
        document.getElementById('effective-type').textContent = '不支持';
        document.getElementById('downlink').textContent = '不支持';
        document.getElementById('rtt').textContent = '不支持';
        document.getElementById('save-data').textContent = '不支持';
    }
}

async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            
            document.getElementById('battery-level').textContent = `${(battery.level * 100).toFixed(0)}%`;
            document.getElementById('battery-charging').textContent = battery.charging ? '充电中' : '未充电';
            document.getElementById('charging-time').textContent = battery.chargingTime === Infinity ? '不适用' : `${Math.floor(battery.chargingTime / 60)} 分钟`;
            document.getElementById('discharging-time').textContent = battery.dischargingTime === Infinity ? '不适用' : `${Math.floor(battery.dischargingTime / 60)} 分钟`;
            
            battery.addEventListener('levelchange', () => {
                document.getElementById('battery-level').textContent = `${(battery.level * 100).toFixed(0)}%`;
            });
            
            battery.addEventListener('chargingchange', () => {
                document.getElementById('battery-charging').textContent = battery.charging ? '充电中' : '未充电';
            });
        } catch (error) {
            document.getElementById('battery-level').textContent = '不支持';
            document.getElementById('battery-charging').textContent = '不支持';
            document.getElementById('charging-time').textContent = '不支持';
            document.getElementById('discharging-time').textContent = '不支持';
        }
    } else {
        document.getElementById('battery-level').textContent = '不支持';
        document.getElementById('battery-charging').textContent = '不支持';
        document.getElementById('charging-time').textContent = '不支持';
        document.getElementById('discharging-time').textContent = '不支持';
    }
}

function getOtherInfo() {
    document.getElementById('user-agent').textContent = navigator.userAgent;
    document.getElementById('current-time').textContent = new Date().toLocaleString('zh-CN');
    document.getElementById('current-page').textContent = window.location.href;
    document.getElementById('referrer').textContent = document.referrer || '直接访问';
    document.getElementById('hardware-concurrency').textContent = navigator.hardwareConcurrency || '无法获取';
    document.getElementById('device-memory').textContent = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '无法获取';
    document.getElementById('touch-support').textContent = 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? '支持' : '不支持';
}

function getDisplayInfo() {
    document.getElementById('avail-width').textContent = `${screen.availWidth} px`;
    document.getElementById('avail-height').textContent = `${screen.availHeight} px`;
    document.getElementById('window-width').textContent = `${window.innerWidth} px`;
    document.getElementById('window-height').textContent = `${window.innerHeight} px`;
    document.getElementById('max-touch-points').textContent = navigator.maxTouchPoints || '0';
    
    const orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
    if (orientation) {
        document.getElementById('orientation').textContent = orientation.type || '无法获取';
    } else {
        document.getElementById('orientation').textContent = window.innerWidth > window.innerHeight ? '横屏' : '竖屏';
    }
}

function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Canvas Fingerprint', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Canvas Fingerprint', 4, 17);
        
        const dataURL = canvas.toDataURL();
        let hash = 0;
        for (let i = 0; i < dataURL.length; i++) {
            const char = dataURL.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        document.getElementById('canvas-fingerprint').textContent = Math.abs(hash).toString(16);
    } catch (error) {
        document.getElementById('canvas-fingerprint').textContent = '无法获取';
    }
}

function getWebGLInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            document.getElementById('webgl').textContent = '支持';
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                document.getElementById('webgl-vendor').textContent = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                document.getElementById('webgl-renderer').textContent = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            } else {
                document.getElementById('webgl-vendor').textContent = '无法获取';
                document.getElementById('webgl-renderer').textContent = '无法获取';
            }
        } else {
            document.getElementById('webgl').textContent = '不支持';
            document.getElementById('webgl-vendor').textContent = '不支持';
            document.getElementById('webgl-renderer').textContent = '不支持';
        }
    } catch (error) {
        document.getElementById('webgl').textContent = '获取失败';
        document.getElementById('webgl-vendor').textContent = '获取失败';
        document.getElementById('webgl-renderer').textContent = '获取失败';
    }
}

async function getMediaDevices() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            document.getElementById('audio-input').textContent = '不支持';
            document.getElementById('audio-output').textContent = '不支持';
            document.getElementById('video-input').textContent = '不支持';
            document.getElementById('media-permission').textContent = '不支持';
            return;
        }
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        
        document.getElementById('audio-input').textContent = `${audioInputs.length} 个设备`;
        document.getElementById('audio-output').textContent = `${audioOutputs.length} 个设备`;
        document.getElementById('video-input').textContent = `${videoInputs.length} 个设备`;
        
        const hasLabels = devices.some(device => device.label !== '');
        document.getElementById('media-permission').textContent = hasLabels ? '已授权' : '未授权';
    } catch (error) {
        document.getElementById('audio-input').textContent = '获取失败';
        document.getElementById('audio-output').textContent = '获取失败';
        document.getElementById('video-input').textContent = '获取失败';
        document.getElementById('media-permission').textContent = '获取失败';
    }
}

function getPermissionsAndFeatures() {
    document.getElementById('dnt').textContent = navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes' ? '已启用' : '未启用';
    document.getElementById('java-enabled').textContent = navigator.javaEnabled ? (navigator.javaEnabled() ? '已启用' : '未启用') : '不支持';
    document.getElementById('pdf-viewer').textContent = navigator.pdfViewerEnabled ? '已启用' : '未启用';
    
    try {
        document.getElementById('local-storage').textContent = typeof localStorage !== 'undefined' ? '支持' : '不支持';
    } catch (e) {
        document.getElementById('local-storage').textContent = '被禁用';
    }
    
    try {
        document.getElementById('session-storage').textContent = typeof sessionStorage !== 'undefined' ? '支持' : '不支持';
    } catch (e) {
        document.getElementById('session-storage').textContent = '被禁用';
    }
    
    document.getElementById('indexed-db').textContent = 'indexedDB' in window ? '支持' : '不支持';
}

function getTimeInfo() {
    const offset = new Date().getTimezoneOffset();
    document.getElementById('timezone-offset').textContent = `UTC${offset > 0 ? '-' : '+'}${Math.abs(offset / 60)}`;
    document.getElementById('timezone-name').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById('system-language').textContent = navigator.language;
    document.getElementById('all-languages').textContent = navigator.languages.join(', ');
}

function getBrowserFeatures() {
    document.getElementById('webrtc').textContent = 'RTCPeerConnection' in window ? '支持' : '不支持';
    document.getElementById('webassembly').textContent = typeof WebAssembly !== 'undefined' ? '支持' : '不支持';
    document.getElementById('service-worker').textContent = 'serviceWorker' in navigator ? '支持' : '不支持';
    document.getElementById('notification').textContent = 'Notification' in window ? '支持' : '不支持';
    document.getElementById('clipboard').textContent = 'clipboard' in navigator ? '支持' : '不支持';
}

function detectFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = [
        'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Palatino',
        'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Impact',
        'Microsoft YaHei', 'SimSun', 'SimHei', 'KaiTi', 'FangSong',
        'PingFang SC', 'Hiragino Sans GB', 'Heiti SC', 'STHeiti',
        'Helvetica', 'Helvetica Neue', 'Lucida Grande', 'Geneva',
        'Tahoma', 'Monaco', 'Consolas', 'Courier'
    ];
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const text = 'mmmmmmmmmmlli';
    const textSize = '72px';
    
    const baseFontWidths = {};
    baseFonts.forEach(baseFont => {
        ctx.font = textSize + ' ' + baseFont;
        baseFontWidths[baseFont] = ctx.measureText(text).width;
    });
    
    const detectedFonts = [];
    testFonts.forEach(font => {
        let detected = false;
        baseFonts.forEach(baseFont => {
            ctx.font = textSize + ' ' + font + ',' + baseFont;
            const width = ctx.measureText(text).width;
            if (width !== baseFontWidths[baseFont]) {
                detected = true;
            }
        });
        if (detected) {
            detectedFonts.push(font);
        }
    });
    
    const fontsContainer = document.getElementById('fonts-list');
    if (detectedFonts.length > 0) {
        fontsContainer.innerHTML = detectedFonts.map(font => 
            `<span class="bg-gray-200 px-2 py-1 rounded text-xs">${font}</span>`
        ).join('');
    } else {
        fontsContainer.textContent = '未检测到常见字体';
    }
}

function getPlugins() {
    const pluginsContainer = document.getElementById('plugins-list');
    
    if (navigator.plugins && navigator.plugins.length > 0) {
        const pluginsList = Array.from(navigator.plugins).map(plugin => plugin.name);
        pluginsContainer.innerHTML = pluginsList.map(plugin => 
            `<div class="border-b pb-1 mb-1">${plugin}</div>`
        ).join('');
    } else {
        pluginsContainer.textContent = '未检测到插件或浏览器不支持插件检测';
    }
}

function getPerformanceInfo() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
        const tcpTime = timing.connectEnd - timing.connectStart;
        const ttfb = timing.responseStart - timing.navigationStart;
        
        document.getElementById('page-load-time').textContent = loadTime > 0 ? `${loadTime} ms` : '计算中...';
        document.getElementById('dns-time').textContent = dnsTime > 0 ? `${dnsTime} ms` : '无法获取';
        document.getElementById('tcp-time').textContent = tcpTime > 0 ? `${tcpTime} ms` : '无法获取';
        document.getElementById('ttfb').textContent = ttfb > 0 ? `${ttfb} ms` : '计算中...';
    } else {
        document.getElementById('page-load-time').textContent = '不支持';
        document.getElementById('dns-time').textContent = '不支持';
        document.getElementById('tcp-time').textContent = '不支持';
        document.getElementById('ttfb').textContent = '不支持';
    }
}

let clickCount = 0;
let keyCount = 0;
let scrollDistance = 0;

function trackUserBehavior() {
    document.addEventListener('mousemove', (e) => {
        document.getElementById('mouse-position').textContent = `X: ${e.clientX}, Y: ${e.clientY}`;
    });
    
    document.addEventListener('click', () => {
        clickCount++;
        document.getElementById('click-count').textContent = clickCount;
    });
    
    document.addEventListener('keydown', () => {
        keyCount++;
        document.getElementById('key-count').textContent = keyCount;
    });
    
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        scrollDistance += Math.abs(currentScroll - lastScrollTop);
        lastScrollTop = currentScroll;
        document.getElementById('scroll-distance').textContent = `${Math.round(scrollDistance)} px`;
    });
}

function getAudioFingerprint() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            document.getElementById('audio-fingerprint').textContent = '不支持';
            document.getElementById('audio-api').textContent = '不支持';
            return;
        }
        
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const analyser = context.createAnalyser();
        const gainNode = context.createGain();
        const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
        
        gainNode.gain.value = 0;
        oscillator.type = 'triangle';
        oscillator.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(gainNode);
        gainNode.connect(context.destination);
        
        scriptProcessor.onaudioprocess = function(event) {
            const output = event.outputBuffer.getChannelData(0);
            let hash = 0;
            for (let i = 0; i < output.length; i++) {
                hash += Math.abs(output[i]);
            }
            document.getElementById('audio-fingerprint').textContent = hash.toFixed(10);
            oscillator.disconnect();
            scriptProcessor.disconnect();
        };
        
        oscillator.start(0);
        document.getElementById('audio-api').textContent = '支持';
        
        setTimeout(() => {
            oscillator.stop();
        }, 100);
    } catch (error) {
        document.getElementById('audio-fingerprint').textContent = '获取失败';
        document.getElementById('audio-api').textContent = '获取失败';
    }
}

function getLocalIPs() {
    const ips = [];
    const ipv6s = [];
    
    if (!window.RTCPeerConnection) {
        document.getElementById('local-ips').textContent = 'WebRTC不支持';
        document.getElementById('ipv6-address').textContent = 'WebRTC不支持';
        return;
    }
    
    const pc = new RTCPeerConnection({iceServers: []});
    pc.createDataChannel('');
    
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
            if (ips.length === 0) {
                document.getElementById('local-ips').textContent = '无法获取';
            }
            if (ipv6s.length === 0) {
                document.getElementById('ipv6-address').textContent = '无';
            }
            return;
        }
        
        const parts = ice.candidate.candidate.split(' ');
        const ip = parts[4];
        
        if (ip && ip !== '0.0.0.0') {
            if (ip.includes(':')) {
                if (!ipv6s.includes(ip)) {
                    ipv6s.push(ip);
                    document.getElementById('ipv6-address').textContent = ipv6s.join(', ');
                }
            } else {
                if (!ips.includes(ip)) {
                    ips.push(ip);
                    document.getElementById('local-ips').textContent = ips.join(', ');
                }
            }
        }
    };
    
    setTimeout(() => {
        pc.close();
    }, 2000);
}

function detectAdBlocker() {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox ad-banner';
    testAd.style.position = 'absolute';
    testAd.style.left = '-9999px';
    document.body.appendChild(testAd);
    
    setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0;
        document.getElementById('ad-blocker').textContent = isBlocked ? '已检测到' : '未检测到';
        document.body.removeChild(testAd);
    }, 100);
}

function detectPrivateMode() {
    try {
        localStorage.setItem('test', '1');
        localStorage.removeItem('test');
        document.getElementById('private-mode').textContent = '否';
    } catch (e) {
        document.getElementById('private-mode').textContent = '可能是';
    }
}

function detectAutomation() {
    const indicators = [];
    
    if (navigator.webdriver) indicators.push('webdriver');
    if (window.callPhantom || window._phantom) indicators.push('PhantomJS');
    if (window.__nightmare) indicators.push('Nightmare');
    if (window.Buffer) indicators.push('Node.js');
    if (window.emit) indicators.push('CouchJS');
    if (window.spawn) indicators.push('Rhino');
    
    document.getElementById('automation').textContent = indicators.length > 0 ? indicators.join(', ') : '未检测到';
}

async function getStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            const quota = (estimate.quota / 1024 / 1024 / 1024).toFixed(2);
            const usage = (estimate.usage / 1024 / 1024).toFixed(2);
            
            document.getElementById('storage-quota').textContent = `${quota} GB`;
            document.getElementById('storage-usage').textContent = `${usage} MB`;
            
            if (navigator.storage.persisted) {
                const persisted = await navigator.storage.persisted();
                document.getElementById('persistent-storage').textContent = persisted ? '已启用' : '未启用';
            } else {
                document.getElementById('persistent-storage').textContent = '不支持';
            }
        } catch (error) {
            document.getElementById('storage-quota').textContent = '获取失败';
            document.getElementById('storage-usage').textContent = '获取失败';
            document.getElementById('persistent-storage').textContent = '获取失败';
        }
    } else {
        document.getElementById('storage-quota').textContent = '不支持';
        document.getElementById('storage-usage').textContent = '不支持';
        document.getElementById('persistent-storage').textContent = '不支持';
    }
}

let pageLoadTime = Date.now();
let lastActivityTime = Date.now();
let activeTime = 0;
let isPageActive = true;
let leaveCount = 0;
let lastPauseTime = 0;
let totalAwayTime = 0;
let currentSessionAwayStart = 0;
let timerInterval = null;

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}时${minutes}分${secs}秒`;
    } else if (minutes > 0) {
        return `${minutes}分${secs}秒`;
    } else {
        return `${secs} 秒`;
    }
}

function trackPageActivity() {
    timerInterval = setInterval(() => {
        if (isPageActive) {
            activeTime++;
            document.getElementById('time-on-page').textContent = formatTime(activeTime);
        } else {
            const currentSessionAway = Math.floor((Date.now() - currentSessionAwayStart) / 1000);
            const displayAwayTime = totalAwayTime + currentSessionAway;
            document.getElementById('away-time').textContent = formatTime(displayAwayTime);
        }
        
        const timeSinceActivity = Math.floor((Date.now() - lastActivityTime) / 1000);
        if (timeSinceActivity < 5) {
            document.getElementById('last-activity').textContent = '刚刚';
        } else if (timeSinceActivity < 60) {
            document.getElementById('last-activity').textContent = `${timeSinceActivity} 秒前`;
        } else {
            document.getElementById('last-activity').textContent = `${Math.floor(timeSinceActivity / 60)} 分钟前`;
        }
    }, 1000);
    
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivityTime = Date.now();
        });
    });
    
    function handleVisibilityChange() {
        if (document.hidden) {
            isPageActive = false;
            currentSessionAwayStart = Date.now();
            lastPauseTime = Date.now();
            document.getElementById('page-visibility').textContent = '隐藏';
        } else {
            if (!isPageActive) {
                const sessionAwayDuration = Math.floor((Date.now() - currentSessionAwayStart) / 1000);
                totalAwayTime += sessionAwayDuration;
                leaveCount++;
                document.getElementById('leave-count').textContent = leaveCount;
                document.getElementById('away-time').textContent = formatTime(totalAwayTime);
                showWelcomeBack();
            }
            isPageActive = true;
            document.getElementById('page-visibility').textContent = '可见';
        }
    }
    
    function handleBlur() {
        isPageActive = false;
        currentSessionAwayStart = Date.now();
        lastPauseTime = Date.now();
        document.getElementById('focus-status').textContent = '失去焦点';
    }
    
    function handleFocus() {
        if (!isPageActive) {
            const sessionAwayDuration = Math.floor((Date.now() - currentSessionAwayStart) / 1000);
            totalAwayTime += sessionAwayDuration;
            leaveCount++;
            document.getElementById('leave-count').textContent = leaveCount;
            document.getElementById('away-time').textContent = formatTime(totalAwayTime);
            showWelcomeBack();
        }
        isPageActive = true;
        document.getElementById('focus-status').textContent = '有焦点';
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
}

function showWelcomeBack() {
    const welcomeBackEl = document.getElementById('welcome-back');
    welcomeBackEl.classList.remove('hidden');
    welcomeBackEl.classList.add('flex');
    
    setTimeout(() => {
        welcomeBackEl.classList.add('hidden');
        welcomeBackEl.classList.remove('flex');
    }, 3000);
}

function updateCurrentTime() {
    document.getElementById('current-time').textContent = new Date().toLocaleString('zh-CN');
}

function loadAllInfo() {
    getIPInfo();
    getGPSLocation();
    getDeviceInfo();
    getBrowserInfo();
    getNetworkInfo();
    getBatteryInfo();
    getOtherInfo();
    getDisplayInfo();
    getCanvasFingerprint();
    getWebGLInfo();
    getMediaDevices();
    getPermissionsAndFeatures();
    getTimeInfo();
    getBrowserFeatures();
    detectFonts();
    getPlugins();
    getPerformanceInfo();
    getAudioFingerprint();
    getLocalIPs();
    detectAdBlocker();
    detectPrivateMode();
    detectAutomation();
    getStorageQuota();
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllInfo();
    trackUserBehavior();
    trackPageActivity();
    
    setInterval(updateCurrentTime, 1000);
    
    setTimeout(() => {
        getPerformanceInfo();
    }, 1000);
    
    document.getElementById('refresh-btn').addEventListener('click', () => {
        document.querySelectorAll('.loading').forEach(el => {
            el.classList.add('loading');
        });
        loadAllInfo();
    });
    
    window.addEventListener('online', () => {
        document.getElementById('online-status').textContent = '在线';
    });
    
    window.addEventListener('offline', () => {
        document.getElementById('online-status').textContent = '离线';
    });
});
