# 素材与开源说明

本项目的素材及运行脚本均已本地保存。页面运行时不访问 CDN、Pexels 或音频网站。

## 指定背景照片
- 摄影：Yura Forrat。
- 页面：https://www.pexels.com/photo/rain-on-city-street-at-night-11866546/
- 下载：https://images.pexels.com/photos/11866546/pexels-photo-11866546.jpeg?auto=compress&cs=tinysrgb&w=2560
- 本地：`assets/rainy-night.jpg`，2560 × 1707。保留该照片，按 1920 × 1080 等比 cover 裁切，垂直锚点 57%，不拉伸。
- 许可：Pexels License，https://www.pexels.com/license/ 。允许免费使用及修改；不可将未经修改的素材独立销售，不暗示人物或摄影师为项目背书。
- 本项目处理：仅显示时裁切、降低饱和度并略微调暗；未替换原场景。

## 真实雨声
- 名称：Rain (loopable)，作者 Ylmir。
- 页面：https://opengameart.org/content/rain-loopable
- 下载：https://opengameart.org/sites/default/files/Rain%20MP3.zip
- 本地：`assets/rain.mp3`，来自压缩包 `1.mp3`，原始音频未编辑，27 秒。
- 许可：CC0 1.0，https://creativecommons.org/publicdomain/zero/1.0/ 。允许复制、修改、分发，无强制署名要求。
- 来源描述为在窗边录制的雨声。默认不创建音频上下文；用户点击后播放。使用 Web Audio 解码真实录音并循环，不是合成噪声。

## raindrop-fx
- 作者：SardineFish；上游 package.json 版本为 1.0.8。
- 仓库：https://github.com/SardineFish/raindrop-fx
- 本地：`vendor/raindrop-fx.js`，浏览器预打包版本。
- MIT 完整许可：`licenses/raindrop-fx-LICENSE.txt`。
- 本地适配：增加透明背景选项、修正透明叠加的 alpha 混合。见 `vendor/ADAPTATION.md`。
- 主引擎沿用上游雨滴生成、碰撞合并、拖尾、光照和折射；内置雾关闭。Canvas 2D 仅作为不支持 WebGL2 / 上下文丢失时的兼容降级。
- 上游打包依赖 zogra-renderer（SardineFish，MIT）和 gl-matrix（MIT），许可见 `licenses/`。

## 擦雾交互参考
- 作者：Raed Ennab。
- 示例：https://codepen.io/Raed-Ennab/pen/ZYWPWej
- CodePen 公共 Pen 的 MIT 许可规则：https://blog.codepen.io/documentation/licensing/
- 保留 `destination-out` 擦除及连续路径思路，改为柔边径向笔刷与 Pointer Events；删除雪花、自动回雾、示例文案与界面。
- 本地实现：`js/fog.js`；许可：`licenses/fog-reference-MIT.txt`。

下载与检查日期：2026-10-10。

# V1.1 增量素材（2026-10-10）

- `assets/room.png`、`assets/speaker.png`、`assets/clock.png`：内置 imagegen 工具生成的独立透明 PNG；用于本项目的室内前景与物件。没有使用整张概念图充当网页背景。完整生成提示词见 `docs/ASSET-PROMPTS.md`。照片风格，非实拍。
- `assets/forest.jpg`：Ivan Petrov，Pexels，Misty Forest Scene with Mossy Fallen Logs。https://www.pexels.com/photo/misty-forest-scene-with-mossy-fallen-logs-35088364/ ，Pexels License。运行时等比裁切及调色。
- `assets/seaside.jpg`：Nothing Ahead，Pexels，Peaceful Beach Scene with Overcast Skies。https://www.pexels.com/photo/peaceful-beach-scene-with-overcast-skies-35657591/ ，Pexels License。运行时等比裁切及调色。
- 明信片复用上述三场景照片，用 CSS 做纸边、透视与悬停位移，不是额外的整幅背景。
- `assets/city.mp3`：Seamless City Loop，qubodup，基于 jmbphilmes 的 CC0 窗边城市录音；CC0。https://freesound.org/people/qubodup/sounds/223093/ 。下载平台提供的 HQ MP3：https://cdn.freesound.org/previews/223/223093_71257-hq.mp3 。
- `assets/wind.wav`：wind1，Luke.RUSTLTD，CC0。https://opengameart.org/content/wind1 。原文件：https://opengameart.org/sites/default/files/wind1.wav 。作者使用 PureData 制作的合成风声，非自然现场录音。音频本身未修改，在浏览器中独立混音和循环。
- 城市原照片、真实雨声、raindrop-fx 与擦雾参考均延续 V1.0；许可完整保留。
