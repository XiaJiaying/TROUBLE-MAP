// hotspots.js
export const hotspots = {
    access: [{ lat: 34.8105, lng: 135.5618 }, { lat: 34.8103, lng: 135.5615 }],
    elevatorwaiting: [{ lat: 34.8106, lng: 135.5619 }, { lat: 34.8102, lng: 135.5612 }],
    monitor: [{ lat: 34.8104, lng: 135.5608 }, { lat: 34.8101, lng: 135.5605 }],
    restaurantwaiting: [{ lat: 34.8107, lng: 135.5613 }, { lat: 34.8105, lng: 135.5611 }],
    xiegui: [{ lat: 34.8102, lng: 135.5603 }, { lat: 34.8104, lng: 135.5605 }],
    zizhuspace: [{ lat: 34.8099, lng: 135.5609 }, { lat: 34.8100, lng: 135.5612 }]
};

/**
 * 在热点附近随机生成坐标
 * @param {Array} hotspots - 预定义热点坐标数组
 * @param {Object} range - 允许随机偏移的范围（经纬度）
 * @param {number} countPerHotspot - 每个热点附近的标记数量
 * @returns {Array} 生成的随机坐标列表
 */
export function generateRandomNearHotspots(hotspots, range, countPerHotspot) {
    let positions = [];
    hotspots.forEach(hotspot => {
        for (let i = 0; i < countPerHotspot; i++) {
            let latOffset = (Math.random() - 0.5) * range.lat;
            let lngOffset = (Math.random() - 0.5) * range.lng;
            positions.push({
                lat: hotspot.lat + latOffset,
                lng: hotspot.lng + lngOffset
            });
        }
    });
    return positions;
}
