export const hotspots = [
    { lat: 34.8105, lng: 135.5605, weight: 0.6 },  // 主入口
    { lat: 34.8100, lng: 135.5615, weight: 0.5 },  // 食堂附近
    { lat: 34.8095, lng: 135.5620, weight: 0.3 },  // 校园边缘
];

export const randomConfig = {
    totalMarkers: 50,  // 总生成的标记数
    hotspotRatio: 0.7,  // 70% 标记放在热点区域
    minLat: 34.809, maxLat: 34.811,  // 地图范围
    minLng: 135.559, maxLng: 135.562
};
