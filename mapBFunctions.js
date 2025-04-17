// mapBFunctions.js
import { hotspots, generateRandomNearHotspots } from './hotspots.js';

let selectedMarkers = []; // 初始化选中的标记数组
let inputValue; // 定义 inputValue 为全局变量
let userResponses = [];


function initMap() {
    var center = { "lat": 34.81025212704146, "lng": 135.56163410692062 }; // 中心坐标OIC
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17.8,
        center: center
    });

    // 允许随机偏移范围（例如 50m 半径）
    const range = { lat: 0.0005, lng: 0.0005 }; 
    const countPerHotspot = 3; 

    // 生成随机坐标
    const positions = {
        access: generateRandomNearHotspots(hotspots.access, range, countPerHotspot),
        elevatorwaiting: generateRandomNearHotspots(hotspots.elevatorwaiting, range, countPerHotspot),
        monitor: generateRandomNearHotspots(hotspots.monitor, range, countPerHotspot),
        restaurantwaiting: generateRandomNearHotspots(hotspots.restaurantwaiting, range, countPerHotspot),
        xiegui: generateRandomNearHotspots(hotspots.xiegui, range, countPerHotspot),
        zizhuspace: generateRandomNearHotspots(hotspots.zizhuspace, range, countPerHotspot)
    };

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

    const infoMessages = {
        access: "自転車駐輪場の出入口が少なすぎて、毎回遠回りしなきゃいけない。本当に面倒くさい…",
        elevatorwaiting: "エレベーターをずっと待っているのに、全然来なくて授業に間に合いそうにありません。どうしよう…？",
        monitor: "モニターがいつも接触不良で、ひどい時は壊れているものもあります。どうしたらいいのでしょうか？",
        restaurantwaiting: "すごく長い列に並ばないとご飯が食べられなくて、しかも座席も少なすぎます…。どうにかならないかな？",
        xiegui: "いつも自分の靴がどの下駄箱にあるか忘れてしまって、よく間違えてしまいます…",
        zizhuspace: "こちらの自習スペースでは飲食やオンライン会議をしても大丈夫ですか？"
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
                    content: inputValue
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

        // 创建 CSV 内容
        const headers = ["Latitude", "Longitude", "Type", "Content"];
        const rows = userResponses.map(response => [
            response.lat,
            response.lng,
            response.type,
            `"${response.content.replace(/"/g, '""')}"` // 处理内容中的双引号
        ]);

        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

        // 创建下载链接
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "user_responses.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

        let message = infoMessages[messageKey];
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



    for (const type in positions) {
        positions[type].forEach(position => addMarker(position, type));
    }

    const infoWindow = new google.maps.InfoWindow();
}