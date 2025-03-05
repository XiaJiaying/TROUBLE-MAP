let selectedMarkers = []; // 初始化选中的标记数组
let inputValue; // 定义 inputValue 为全局变量
let userResponses = [];
import { hotspots, randomConfig } from './markerConfig.js';


function initMap() {
    var center = { "lat": 34.81025212704146, "lng": 135.56163410692062 }; // 中心坐标OIC
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17.8,
        center: center
    });
    
    generateMarkers();

    // 定义图标
    const icons = {
        access: { url: 'troublemap2/access/gantanhao.png', scaledSize: new google.maps.Size(25, 25) },
        elevatorwaiting: { url: 'troublemap2/elevatorwaiting/dengdai.png', scaledSize: new google.maps.Size(25, 25) },
        monitor: { url: 'troublemap2/monitor/guzhang.png', scaledSize: new google.maps.Size(25, 25) },
        restaurantwaiting: { url: 'troublemap2/restaurantwaiting/dengdai.png', scaledSize: new google.maps.Size(25, 25) },
        xiegui: { url: 'troublemap2/xiegui/xiegui.png', scaledSize: new google.maps.Size(25, 25) },
        zizhuspace: { url: 'troublemap2/zizhuspace/wenhao.png', scaledSize: new google.maps.Size(25, 25) },

        // 选中图标
        accessSelected: { url: 'troublemap2/access/gantanhao_selected.png', scaledSize: new google.maps.Size(25, 25) },
        elevatorwaitingSelected: { url: 'troublemap2/elevatorwaiting/dengdai_selected.png', scaledSize: new google.maps.Size(25, 25) },
        monitorSelected: { url: 'troublemap2/monitor/guzhang_selected.png', scaledSize: new google.maps.Size(25, 25) },
        restaurantwaitingSelected: { url: 'troublemap2/restaurantwaiting/dengdai_selected.png', scaledSize: new google.maps.Size(25, 25) },
        xieguiSelected: { url: 'troublemap2/xiegui/xiegui_selected.png', scaledSize: new google.maps.Size(25, 25) },
        zizhuspaceSelected: { url: 'troublemap2/zizhuspace/wenhao_selected.png', scaledSize: new google.maps.Size(25, 25) },

        // 已回答图标（透明）
        accessAnswered: { url: 'troublemap2/access/gantanhao.png', scaledSize: new google.maps.Size(25, 25), opacity: 0.5 },
        elevatorwaitingAnswered: { url: 'troublemap2/elevatorwaiting/dengdai.png', scaledSize: new google.maps.Size(25, 25), opacity: 0.5 },
        monitorAnswered: { url: 'troublemap2/monitor/guzhang.png', scaledSize: new google.maps.Size(25, 25), opacity: 0.5 },
        restaurantwaitingAnswered: { url: 'troublemap2/restaurantwaiting/dengdai.png', scaledSize: new google.maps.Size(25, 25), opacity: 0.5 },
        xieguiAnswered: { url: 'troublemap2/xiegui/xiegui.png', scaledSize: new google.maps.Size(25, 25), opacity: 0.5 },
        zizhuspaceAnswered: { url: 'troublemap2/zizhuspace/wenhao.png', scaledSize: new google.maps.Size(25, 25), opacity: 0.5 }
    };

    const markerGroups = {
        access: [],
        elevatorwaiting: [],
        monitor: [],
        restaurantwaiting: [],
        xiegui: [],
        zizhuspace: []
    };

    // 计算距离
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000;
        const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180, Δλ = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // 清除之前选中的标记
    function clearSelectedMarkers() {
        selectedMarkers.forEach(marker => {
            if (!marker.answered) marker.setIcon(marker.defaultIcon);
        });
        selectedMarkers = [];
    }

    function markAsAnswered() {
        selectedMarkers.forEach(marker => {
            if (!marker.answered) {
                marker.setIcon(marker.answeredIcon);
                marker.answered = true;
                marker.answerContent = inputValue;
                marker.setOpacity(0.5);

                // 保存到 userResponses
                userResponses.push({
                    lat: marker.position.lat(),
                    lng: marker.position.lng(),
                    type: marker.type,
                    originalMessage: marker.originalMessage || "メッセージなし", // 防止 undefined // 记录原始问题描述
                    content: inputValue || "未回答" // 确保不为空
                });

            }
        });
        selectedMarkers = [];
    }

    function exportToCSV() {
        if (userResponses.length === 0) {
            alert("没有数据可以导出！");
            return;
        }
    
        console.log("开始生成 CSV 文件...");
    
        //  确保 UTF-8 BOM 变量被定义
        const BOM = "\uFEFF";  // Excel 兼容 UTF-8，防止乱码
    
        // CSV 头部
        const headers = ["经度", "纬度", "类型", "信息窗中的问题", "回答内容"];
    
        // 确保数据不会包含 `undefined` 或 `NaN`
        const rows = userResponses.map(response => [
            response.lat,
            response.lng,
            response.type,
            `"${(response.originalMessage || "メッセージなし").replace(/"/g, '""')}"`, // 避免 undefined
            `"${(response.content || "未回答").replace(/"/g, '""')}"` // 避免 undefined
        ]);
    
        //  先定义 `csvContent`
        let csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
        //  现在 `BOM` 已经定义，不会报错
        csvContent = BOM + csvContent;
    
        console.log("CSV 内容：", csvContent);
    
        // 创建 Blob 文件对象
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        console.log("生成的 URL：", url);
    
        // 创建并触发下载
        const link = document.createElement("a");
        link.href = url;
        link.download = "user_responses.csv";
        document.body.appendChild(link);
    
        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
            console.log("CSV 下载完成！");
        }, 100);
    }
    
    

    // 使函数可供全局调用
    window.exportToCSV = exportToCSV;

    function handleMarkerClick(marker, markerGroup, selectedIcon, answeredIcon, messageKey) {
        if (marker.answered) {
            infoWindow.setContent(`回答しました！ご協力ありがとうございます。<br>あなたの答えは「<span style="color: blue;">${marker.answerContent}</span>」です`);
            infoWindow.open(map, marker);
            return;
        }

        clearSelectedMarkers();
        marker.setIcon(selectedIcon);
        selectedMarkers.push(marker);

        let countInRange = 0;
        markerGroup.forEach(m => {
            const distance = calculateDistance(marker.position.lat(), marker.position.lng(), m.position.lat(), m.position.lng());
            if (distance <= 20) {
                countInRange++;
                if (m !== marker && !m.answered) {
                    m.setIcon(selectedIcon);
                    selectedMarkers.push(m);
                }
            }
        });

        // 随机选择不同的表达方式
        let messageOptions = infoMessages[messageKey] || ["デフォルトのメッセージ"];
        let message = messageOptions[Math.floor(Math.random() * messageOptions.length)];

        marker.originalMessage = message;

        infoWindow.setContent(`
                    <div>
                        <p>${message}</p>
                        <p>同じ悩みを抱えている人が20メートル圏内に <span style="color: red;"> ${countInRange} </span> 人います!</p>
                        <input type="text" id="input-box" placeholder="あなたに助けてもらいたいです!" style="width: 75%; margin-top: 10px;">
                        <button onclick="sendAnswer()">送信</button>
                    </div>
                `);
        infoWindow.open(map, marker);

        window.sendAnswer = function () {
            inputValue = document.getElementById('input-box').value;
            if (inputValue) {
                markAsAnswered();
                infoWindow.close();
                infoWindow.setContent(`ご回答ありがとうございます!<br>あなたの答えは「<span style="color: blue;">${marker.answerContent}</span>」です`);
                infoWindow.open(map, marker);
            } else {
                alert("入力内容が空です。入力してください！");
            }
        };
    }

    function addMarker(position, type) {
        const icon = icons[type];
        const selectedIcon = icons[type + 'Selected'];
        const answeredIcon = icons[type + 'Answered'];

        const marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: icon,
            defaultIcon: icon,
            answeredIcon: answeredIcon,
            answered: false,
            answerContent: "",
            type: type // 添加类型信息
        });

        markerGroups[type].push(marker);
        marker.addListener('click', () => handleMarkerClick(marker, markerGroups[type], selectedIcon, answeredIcon, type));
    }

    function generateMarkers() {
        const markerTypes = Object.keys(icons).filter(type => !type.includes("Selected") && !type.includes("Answered"));
    
        let numHotspotMarkers = Math.floor(randomConfig.totalMarkers * randomConfig.hotspotRatio);
        let numRandomMarkers = randomConfig.totalMarkers - numHotspotMarkers;
    
        // 1. 在热点区域生成标记
        for (let i = 0; i < numHotspotMarkers; i++) {
            let hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
            let randomLat = hotspot.lat + (Math.random() - 0.5) * 0.0003 * hotspot.weight;
            let randomLng = hotspot.lng + (Math.random() - 0.5) * 0.0003 * hotspot.weight;
            let randomType = markerTypes[Math.floor(Math.random() * markerTypes.length)];
    
            addMarker({ lat: randomLat, lng: randomLng }, randomType);
        }
    
        // 2. 在整个地图区域随机生成标记
        for (let i = 0; i < numRandomMarkers; i++) {
            let randomLat = randomConfig.minLat + (randomConfig.maxLat - randomConfig.minLat) * Math.random();
            let randomLng = randomConfig.minLng + (randomConfig.maxLng - randomConfig.minLng) * Math.random();
            let randomType = markerTypes[Math.floor(Math.random() * markerTypes.length)];
    
            addMarker({ lat: randomLat, lng: randomLng }, randomType);
        }
    }
    
    for (const type in positions) {
        positions[type].forEach(position => addMarker(position, type));
    }

    const infoWindow = new google.maps.InfoWindow();// 设置信息窗口

}