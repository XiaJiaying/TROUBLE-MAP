let selectedMarkers = []; // 初始化选中的标记数组
let inputValue; // 定义 inputValue 为全局变量
let userResponses = [];


function initMap() {
    var center = { "lat": 34.81025212704146, "lng": 135.56163410692062 }; // 中心坐标OIC
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17.8,
        center: center
    });

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

    const positions = {
        access: [
            { "lat": 34.81097969573489, "lng": 135.5601785791285 },
            { "lat": 34.810895970478924, "lng": 135.56066286988752 },
            { "lat": 34.81094334317318, "lng": 135.56047908856306 },
            { "lat": 34.81108303873703, "lng": 135.56056018577868 },
            { "lat": 34.81094213062494, "lng": 135.56041818296166 },
            { "lat": 34.81078854407772, "lng": 135.56058119012215 },
            { "lat": 34.81103483854267, "lng": 135.56049206813444 },
            { "lat": 34.81092945921381, "lng": 135.56060023486666 },
            { "lat": 34.811095211368176, "lng": 135.56022289202704 },
            { "lat": 34.810878744467075, "lng": 135.5604244891423 },
            { "lat": 34.810886715024694, "lng": 135.56056250938664 },
            { "lat": 34.81080853548907, "lng": 135.56028036630298 },
            { "lat": 34.81117110971036, "lng": 135.56047357820623 },
            { "lat": 34.81100695172235, "lng": 135.5604801804567 },
            { "lat": 34.81093927960013, "lng": 135.56046244285298 },
            { "lat": 34.810944525623164, "lng": 135.5605198362466 },
            { "lat": 34.81076789463937, "lng": 135.56031279808434 }
        ],
        elevatorwaiting: [
            { "lat": 34.81081267464342, "lng": 135.56128890567396 },
            { "lat": 34.81086552707235, "lng": 135.56130606463475 },
            { "lat": 34.81092900560499, "lng": 135.56120294437605 },
            { "lat": 34.810812901491, "lng": 135.5612958013279 },
            { "lat": 34.810869213035595, "lng": 135.56129868484595 },
            { "lat": 34.810922333568236, "lng": 135.56129458281066 },
            { "lat": 34.810838830540234, "lng": 135.5612086878326 },
            { "lat": 34.81085942571905, "lng": 135.56132351635043 },
            { "lat": 34.81084477384215, "lng": 135.5613156174922 },
            { "lat": 34.81086001373316, "lng": 135.56119657445927 },
            { "lat": 34.81084847240375, "lng": 135.56131204303756 },
            { "lat": 34.810806315157585, "lng": 135.56123299549034 },
            { "lat": 34.81087362823534, "lng": 135.56130402493912 },

            { "lat": 34.81127675003824, "lng": 135.56115523984562 },
            { "lat": 34.81122036369436, "lng": 135.56121347887853 },
            { "lat": 34.81124202132597, "lng": 135.5612239589131 },
            { "lat": 34.81121792196102, "lng": 135.5612025495478 },
            { "lat": 34.81124015027445, "lng": 135.56121661290825 },
            { "lat": 34.81130662651119, "lng": 135.56121730843287 },
            { "lat": 34.81125146256814, "lng": 135.56125169068363 },

            { "lat": 34.809840395350605, "lng": 135.56088508846113 },
            { "lat": 34.809960912363145, "lng": 135.56086043081572 },
            { "lat": 34.80995363411113, "lng": 135.56084454974112 },
            { "lat": 34.80992656538678, "lng": 135.5608282764308 },
            { "lat": 34.80990985741234, "lng": 135.56092621883928 },
            { "lat": 34.809906437212724, "lng": 135.56087300242896 },
            { "lat": 34.809900564424645, "lng": 135.56081135677172 },
            { "lat": 34.80982603628324, "lng": 135.56086416822393 },
            { "lat": 34.809906065392866, "lng": 135.560865028129 },
            { "lat": 34.809896323436604, "lng": 135.56089716511153 },
            { "lat": 34.80986529012921, "lng": 135.56083072362992 },
            { "lat": 34.80995279175484, "lng": 135.56094279308783 },
            { "lat": 34.80993227358415, "lng": 135.56088474103097 },
            { "lat": 34.809909442277245, "lng": 135.5609485440524 },
            { "lat": 34.80996024472058, "lng": 135.5608773884655 },
            { "lat": 34.80991995139708, "lng": 135.5608886974976 },
            { "lat": 34.80987416257043, "lng": 135.56088697834238 },
            { "lat": 34.80988485657494, "lng": 135.56086463758226 },
            { "lat": 34.809928375792914, "lng": 135.5608732110126 },
            { "lat": 34.809850685144006, "lng": 135.56078900721815 },
            { "lat": 34.80988496865283, "lng": 135.56096315765035 },
            { "lat": 34.80988010377416, "lng": 135.5608019554871 },
            { "lat": 34.809917516892824, "lng": 135.56088519650842 }


        ],
        monitor: [
            { "lat": 34.810051352937435, "lng": 135.56061800967504 },
            { "lat": 34.80995960195512, "lng": 135.5606604229661 },
            { "lat": 34.80997612808246, "lng": 135.56065846553903 },
            { "lat": 34.81004557209649, "lng": 135.56066565638065 },
            { "lat": 34.80997481648596, "lng": 135.56064574237783 },
            { "lat": 34.80996351092628, "lng": 135.56055285039972 },
            { "lat": 34.810035083576274, "lng": 135.56058101059702 }
        ],
        restaurantwaiting: [
            { "lat": 34.81042776557999, "lng": 135.56144102240336 },
            { "lat": 34.810375054367576, "lng": 135.56134111393348 },
            { "lat": 34.81029788973102, "lng": 135.56138036522842 },
            { "lat": 34.81041846447367, "lng": 135.56125986183883 },
            { "lat": 34.81030635277106, "lng": 135.56114249469502 },
            { "lat": 34.81041149746689, "lng": 135.5612757583536 },
            { "lat": 34.81024012771612, "lng": 135.5612139198314 },
            { "lat": 34.810486676922814, "lng": 135.56108606970776 },
            { "lat": 34.810451972070716, "lng": 135.5612431031492 },
            { "lat": 34.81043947016958, "lng": 135.5611125376839 },
            { "lat": 34.81026858786591, "lng": 135.5612165862944 },
            { "lat": 34.81042569281534, "lng": 135.56129246910533 },
            { "lat": 34.810417030920576, "lng": 135.56128715484246 },
            { "lat": 34.810315627277944, "lng": 135.56121458514366 },
            { "lat": 34.810446257200816, "lng": 135.561377795716 },
            { "lat": 34.810474686450405, "lng": 135.56122851296982 },
            { "lat": 34.81040875503298, "lng": 135.56123653302802 },
            { "lat": 34.81028192037269, "lng": 135.56117248067338 },
            { "lat": 34.81029751354531, "lng": 135.5611448478356 },
            { "lat": 34.81041072217693, "lng": 135.56123207477955 },
            { "lat": 34.81047563334011, "lng": 135.5612427845664 },
            { "lat": 34.81043502439544, "lng": 135.56125454521822 },
            { "lat": 34.81034497829983, "lng": 135.56138441967263 },
            { "lat": 34.8104021280012, "lng": 135.56128230904622 },
            { "lat": 34.810274732907835, "lng": 135.5613522238696 },
            { "lat": 34.81036910216807, "lng": 135.56145592331904 },
            { "lat": 34.810544931511224, "lng": 135.56122200920154 },
            { "lat": 34.810497650832026, "lng": 135.5611639878433 },
            { "lat": 34.810386758100385, "lng": 135.56147231582943 },
            { "lat": 34.810533162181784, "lng": 135.56118689909263 },
            { "lat": 34.81046176755838, "lng": 135.56124836595953 },
            { "lat": 34.81042500087931, "lng": 135.56121056990662 },
            { "lat": 34.81036455138138, "lng": 135.56112900592777 },
            { "lat": 34.81032600559549, "lng": 135.56117042220956 },
            { "lat": 34.810390562685946, "lng": 135.5611802451527 },
            { "lat": 34.81053832551567, "lng": 135.56113289112588 },
            { "lat": 34.81044520905469, "lng": 135.5612595741239 },
            { "lat": 34.810375143819904, "lng": 135.56122909921913 },
            { "lat": 34.8104056851326, "lng": 135.56129642157083 },
            { "lat": 34.81046246311196, "lng": 135.56133346344276 },
            { "lat": 34.81036285188101, "lng": 135.56127268761531 },
            { "lat": 34.81051893916291, "lng": 135.5613494774497 },
            { "lat": 34.810428161875365, "lng": 135.56130866293492 },
            { "lat": 34.81038148588212, "lng": 135.5611557193141 },
            { "lat": 34.81035094853613, "lng": 135.5612187188875 },
            { "lat": 34.81044123532505, "lng": 135.5612864602929 },
            { "lat": 34.810323002786326, "lng": 135.56123277800316 },
            { "lat": 34.81033594144133, "lng": 135.56136993053343 },
            { "lat": 34.81039174017891, "lng": 135.56126995653676 },
            { "lat": 34.81043670365831, "lng": 135.56129999458594 },

            { "lat": 34.810419614599596, "lng": 135.56168898626873 },
            { "lat": 34.810430127608555, "lng": 135.56171909498516 },
            { "lat": 34.81041580633713, "lng": 135.56170487484405 },
            { "lat": 34.81052791098423, "lng": 135.56176276948406 },
            { "lat": 34.81032345850209, "lng": 135.56168550970392 },
            { "lat": 34.81038930594143, "lng": 135.56178818679427 },
            { "lat": 34.8103449179628, "lng": 135.56175510773548 },
            { "lat": 34.81043737128485, "lng": 135.56185557997415 },
            { "lat": 34.810423187183844, "lng": 135.56185857942236 },
            { "lat": 34.81039791798448, "lng": 135.56177307370297 },
            { "lat": 34.81034902875029, "lng": 135.56163938662456 },
            { "lat": 34.81038909061276, "lng": 135.5615549975941 },
            { "lat": 34.81044621666947, "lng": 135.56181085472832 },
            { "lat": 34.810470659653376, "lng": 135.56184619246787 },
            { "lat": 34.810370801449686, "lng": 135.56169379319755 },
            { "lat": 34.81027760387321, "lng": 135.5617707744701 },
            { "lat": 34.810535770533484, "lng": 135.56165372449811 },
            { "lat": 34.81045262411474, "lng": 135.56175884612765 },
            { "lat": 34.81025585380443, "lng": 135.5617909478102 },
            { "lat": 34.81051338623113, "lng": 135.56158492788035 },
            { "lat": 34.81047686987597, "lng": 135.56168355890952 },
            { "lat": 34.81032306470311, "lng": 135.56179347850704 },
            { "lat": 34.81053883882403, "lng": 135.56172409479595 },
            { "lat": 34.81044277293757, "lng": 135.56169605075846 },
            { "lat": 34.8103129862508, "lng": 135.56165298650154 },
            { "lat": 34.810297679786316, "lng": 135.5615813522747 },
            { "lat": 34.81042350324457, "lng": 135.56170508760752 },
            { "lat": 34.81048637016001, "lng": 135.56173600301904 },
            { "lat": 34.81056030049451, "lng": 135.56176193968224 },
            { "lat": 34.810412884527516, "lng": 135.56169615764267 },
            { "lat": 34.81050025076921, "lng": 135.5617006801817 },
            { "lat": 34.81040315431738, "lng": 135.56169690324356 },
            { "lat": 34.81048810800772, "lng": 135.56166926783945 }
        ],
        xiegui: [
            { "lat": 34.81036909770973, "lng": 135.5603900080281 },
            { "lat": 34.81042146098799, "lng": 135.5603988557694 },
            { "lat": 34.81038681523834, "lng": 135.56037271975424 },
            { "lat": 34.810426847543106, "lng": 135.56041447667818 },
            { "lat": 34.81045233837585, "lng": 135.56047949699297 },
            { "lat": 34.81040382338726, "lng": 135.560432833153 },
            { "lat": 34.81039684961692, "lng": 135.56045972352493 },
            { "lat": 34.810414836043705, "lng": 135.56048184967563 },
            { "lat": 34.81041200246236, "lng": 135.56044938363098 }
        ],
        zizhuspace: [
            { "lat": 34.809978397312385, "lng": 135.56044675088995 },
            { "lat": 34.80991262557624, "lng": 135.56050560403364 },
            { "lat": 34.80993769561133, "lng": 135.56046160907104 },
            { "lat": 34.809894659644094, "lng": 135.56038141847728 },
            { "lat": 34.80992693003518, "lng": 135.5604502804093 },
            { "lat": 34.809931228347416, "lng": 135.56045848510567 },
            { "lat": 34.80981200477878, "lng": 135.56055552215273 },
            { "lat": 34.809885247987644, "lng": 135.56055607465 },
            { "lat": 34.80992105830526, "lng": 135.56052437950424 },
            { "lat": 34.80984048577804, "lng": 135.56053874490172 },
            { "lat": 34.80986876974001, "lng": 135.56050106234514 },
            { "lat": 34.809868790851766, "lng": 135.56049176032812 },

            { "lat": 34.8099877205093, "lng": 135.56120668201956 },
            { "lat": 34.80995387202038, "lng": 135.5612521321626 },
            { "lat": 34.80991107641539, "lng": 135.56124219747255 },
            { "lat": 34.80994256135137, "lng": 135.5612654203537 },
            { "lat": 34.809938159314804, "lng": 135.5612338118151 },
            { "lat": 34.80994728529416, "lng": 135.56120513344698 },
            { "lat": 34.809934481121175, "lng": 135.5611542816496 },
            { "lat": 34.809897293117025, "lng": 135.56130580458444 },
            { "lat": 34.809936670980704, "lng": 135.56130086076294 },
            { "lat": 34.80987745285685, "lng": 135.56124634864554 },
            { "lat": 34.80996482881951, "lng": 135.5612147195188 },

            { "lat": 34.810826671578624, "lng": 135.56116849288162 },
            { "lat": 34.81074827844336, "lng": 135.561142235364 },
            { "lat": 34.81085690566266, "lng": 135.5610748222764 },
            { "lat": 34.81084391874667, "lng": 135.5612068712649 },
            { "lat": 34.81083190740011, "lng": 135.5610765630791 },
            { "lat": 34.81080194148217, "lng": 135.5610702529316 },
            { "lat": 34.81075412093038, "lng": 135.56104820143383 },
            { "lat": 34.81080765555655, "lng": 135.56105554916658 },
            { "lat": 34.810839694838855, "lng": 135.5611211913307 },

            { "lat": 34.81127341755438, "lng": 135.56144049573052 },
            { "lat": 34.811244551716214, "lng": 135.56142297843544 },
            { "lat": 34.81124139800501, "lng": 135.5614001971084 },
            { "lat": 34.811244988297275, "lng": 135.56145301518296 },
            { "lat": 34.811309528793, "lng": 135.5614576921792 },
            { "lat": 34.811263455806056, "lng": 135.5614551843952 },
            { "lat": 34.81119651399174, "lng": 135.56145167051636 },


            { "lat": 34.809940475358225, "lng": 135.56245200278562 },
            { "lat": 34.8097552031096, "lng": 135.56230551531766 },
            { "lat": 34.809585889319365, "lng": 135.56239657015828 },
            { "lat": 34.809599917289724, "lng": 135.5621756402431 },
            { "lat": 34.80979284135394, "lng": 135.5625046743923 },
            { "lat": 34.809692468917696, "lng": 135.56225546611626 },
            { "lat": 34.809924415478655, "lng": 135.56223170669952 },
            { "lat": 34.8097070319862, "lng": 135.56242490635924 },
            { "lat": 34.80950297270475, "lng": 135.56233842675277 },
            { "lat": 34.809752253411034, "lng": 135.56227571185104 },
            { "lat": 34.80990628361255, "lng": 135.5621225033501 },
            { "lat": 34.809994300124714, "lng": 135.56231217380085 },
            { "lat": 34.809604474330236, "lng": 135.56250428772643 },
            { "lat": 34.80962174224438, "lng": 135.56213052328607 },
            { "lat": 34.809754953404145, "lng": 135.5622953120261 },
            { "lat": 34.80989988324134, "lng": 135.56228003761814 },
            { "lat": 34.80963082241876, "lng": 135.5622580605768 },

            { "lat": 34.809752237514154, "lng": 135.56278914726457 },
            { "lat": 34.81000461118678, "lng": 135.5629382924226 },
            { "lat": 34.81002558257361, "lng": 135.56284478225635 },
            { "lat": 34.809917784145824, "lng": 135.5628441236475 },
            { "lat": 34.80999411975004, "lng": 135.5627827545392 },
            { "lat": 34.80996359426743, "lng": 135.5628424877577 },
            { "lat": 34.80991021418116, "lng": 135.56277112903197 },
            { "lat": 34.80999190587017, "lng": 135.56278048072136 },
            { "lat": 34.80999774898659, "lng": 135.56287230101492 },
            { "lat": 34.80972424780387, "lng": 135.56293615913236 },
            { "lat": 34.81002695079476, "lng": 135.56285697340596 },
            { "lat": 34.810022496105816, "lng": 135.5630851821168 },
            { "lat": 34.80993474644155, "lng": 135.5628148766031 },
            { "lat": 34.80973919309487, "lng": 135.5626708248195 },
            { "lat": 34.809811302909594, "lng": 135.56258217684507 },
            { "lat": 34.80989629861793, "lng": 135.56283191622 },
            { "lat": 34.80975730288833, "lng": 135.56281747352142 },
            { "lat": 34.80995500631197, "lng": 135.562982337118 },
            { "lat": 34.80999045460476, "lng": 135.56302069339642 }
        ]
    };

    for (const type in positions) {
        positions[type].forEach(position => addMarker(position, type));
    }

    const infoWindow = new google.maps.InfoWindow();
}