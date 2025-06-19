/**
 * 图片字幕生成器 - 核心JavaScript功能
 * 实现图片上传、字幕添加、水印设置、样式调整等功能
 */

class ImageSubtitleGenerator {
    constructor() {
        // 核心元素引用
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewPlaceholder = document.getElementById('previewPlaceholder');
        this.imageInfo = document.getElementById('imageInfo');
        
        // 按钮元素
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // 文本输入元素
        this.subtitleText = document.getElementById('subtitleText');
        this.watermarkText = document.getElementById('watermarkText');
        
        // 字幕样式控制元素
        this.subtitleColor = document.getElementById('subtitleColor');
        this.subtitleStrokeColor = document.getElementById('subtitleStrokeColor');
        this.subtitleStrokeWidth = document.getElementById('subtitleStrokeWidth');
        this.subtitleStrokeWidthValue = document.getElementById('subtitleStrokeWidthValue');
        
        // 水印样式控制元素
        this.watermarkColor = document.getElementById('watermarkColor');
        this.watermarkOpacity = document.getElementById('watermarkOpacity');
        this.watermarkOpacityValue = document.getElementById('watermarkOpacityValue');
        
        // Canvas 上下文和原始图片
        this.ctx = this.previewCanvas.getContext('2d');
        this.originalImage = null;
        
        // 初始化应用
        this.init();
    }

    /**
     * 初始化应用 - 绑定事件监听器
     */
    init() {
        // 上传相关事件
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // 拖拽上传事件
        this.setupDragAndDrop();
        
        // 按钮事件
        this.generateBtn.addEventListener('click', () => this.generatePreview());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.resetBtn.addEventListener('click', () => this.resetAll());
        
        // 文本输入事件 - 实时更新
        this.subtitleText.addEventListener('input', () => this.autoGeneratePreview());
        this.watermarkText.addEventListener('input', () => this.autoGeneratePreview());
        
        // 样式控制事件 - 实时更新
        this.setupStyleControls();
        
        console.log('图片字幕生成器初始化完成！');
    }

    /**
     * 设置拖拽上传功能
     */
    setupDragAndDrop() {
        // 阻止默认拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // 拖拽视觉反馈
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.remove('dragover');
            }, false);
        });

        // 处理文件拖拽
        this.uploadArea.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.handleImageFile(files[0]);
            } else {
                alert('请拖拽图片文件！');
            }
        }, false);
    }

    /**
     * 阻止默认事件
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * 设置样式控制事件监听
     */
    setupStyleControls() {
        // 字幕样式控制
        this.subtitleStrokeWidth.addEventListener('input', () => {
            this.subtitleStrokeWidthValue.textContent = this.subtitleStrokeWidth.value + 'px';
            this.autoGeneratePreview();
        });
        
        [this.subtitleColor, this.subtitleStrokeColor].forEach(element => {
            element.addEventListener('change', () => this.autoGeneratePreview());
        });
        
        // 水印样式控制
        this.watermarkOpacity.addEventListener('input', () => {
            this.watermarkOpacityValue.textContent = Math.round(this.watermarkOpacity.value * 100) + '%';
            this.autoGeneratePreview();
        });
        
        this.watermarkColor.addEventListener('change', () => this.autoGeneratePreview());
    }

    /**
     * 处理图片上传
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.handleImageFile(file);
        } else {
            alert('请选择有效的图片文件！');
        }
    }

    /**
     * 处理图片文件
     */
    handleImageFile(file) {
        // 检查文件大小 (限制10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('图片文件过大，请选择小于10MB的图片！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImage(e.target.result, file);
        };
        reader.readAsDataURL(file);
    }

    /**
     * 加载图片到Canvas
     */
    loadImage(imageSrc, file) {
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.displayImageInfo(img, file);
            this.generatePreview();
            this.enableButtons();
            
            // 隐藏占位符，显示canvas
            this.previewPlaceholder.style.display = 'none';
            this.previewCanvas.style.display = 'block';
            this.imageInfo.style.display = 'block';
            
            console.log('图片加载成功:', img.width + 'x' + img.height);
        };
        img.onerror = () => {
            alert('图片加载失败，请尝试其他图片！');
        };
        img.src = imageSrc;
    }

    /**
     * 显示图片信息
     */
    displayImageInfo(img, file) {
        document.getElementById('imageDimensions').textContent = `${img.width} × ${img.height}`;
        document.getElementById('imageSize').textContent = this.formatFileSize(file.size);
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 启用按钮
     */
    enableButtons() {
        this.generateBtn.disabled = false;
        this.downloadBtn.disabled = false;
    }

    /**
     * 自动生成预览（有图片时）
     */
    autoGeneratePreview() {
        if (this.originalImage) {
            this.generatePreview();
        }
    }

    /**
     * 生成预览效果
     */
    generatePreview() {
        if (!this.originalImage) {
            alert('请先上传图片！');
            return;
        }

        // 获取字幕文本（按行分割）
        const subtitleLines = this.subtitleText.value
            .split('\n')
            .filter(line => line.trim() !== '');

        // 计算Canvas尺寸
        const canvasWidth = this.originalImage.width;
        const singleSubtitleHeight = this.calculateSingleSubtitleHeight();
        // 所有字幕都需要额外空间，第一行覆盖原图底部，后续行添加到下方
        const additionalHeight = subtitleLines.length > 0 ? (subtitleLines.length - 1) * singleSubtitleHeight : 0;
        const canvasHeight = this.originalImage.height + additionalHeight;

        // 设置Canvas尺寸
        this.previewCanvas.width = canvasWidth;
        this.previewCanvas.height = canvasHeight;

        // 清空Canvas
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 绘制原始图片
        this.ctx.drawImage(this.originalImage, 0, 0);

        // 绘制叠加的图片段和字幕
        this.drawLayeredSubtitles(subtitleLines, singleSubtitleHeight);

        // 绘制水印
        this.drawWatermark();

        console.log('预览生成完成');
    }

    /**
     * 计算单行字幕区域高度（根据图片大小自适应，使用固定较大字体）
     */
    calculateSingleSubtitleHeight() {
        const imageHeight = this.originalImage.height;
        // 使用固定的较大字体大小
        const fontSize = this.getFixedFontSize();
        
        // 根据图片高度自适应字幕高度，通常为图片高度的10-15%
        let baseHeight;
        if (imageHeight <= 400) {
            baseHeight = Math.max(80, imageHeight * 0.15);
        } else if (imageHeight <= 800) {
            baseHeight = Math.max(100, imageHeight * 0.12);
        } else {
            baseHeight = Math.max(120, imageHeight * 0.10);
        }
        
        // 确保字幕高度能容纳字体大小
        const minHeightForFont = fontSize * 2.5; // 字体大小的2.5倍作为最小高度
        
        return Math.max(baseHeight, minHeightForFont);
    }

    /**
     * 获取固定的字体大小（根据图片尺寸自适应）
     */
    getFixedFontSize() {
        const imageHeight = this.originalImage.height;
        const imageWidth = this.originalImage.width;
        const minDimension = Math.min(imageWidth, imageHeight);
        
        // 根据图片最小尺寸计算合适的字体大小
        if (minDimension <= 400) {
            return 32;
        } else if (minDimension <= 600) {
            return 40;
        } else if (minDimension <= 800) {
            return 48;
        } else if (minDimension <= 1200) {
            return 56;
        } else {
            return 64;
        }
    }

    /**
     * 绘制叠加的图片段和字幕
     */
    drawLayeredSubtitles(subtitleLines, singleSubtitleHeight) {
        if (subtitleLines.length === 0) return;

        const fontSize = this.getFixedFontSize(); // 使用固定字体大小
        const fontFamily = 'Microsoft YaHei'; // 固定使用微软雅黑字体
        const fontColor = this.subtitleColor.value;
        const strokeColor = this.subtitleStrokeColor.value;
        const strokeWidth = parseInt(this.subtitleStrokeWidth.value);

        // 设置字体样式
        this.ctx.font = `bold ${fontSize}px ${fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // 计算要截取的原图底部区域（所有字幕都使用同一段图片）
        const sourceY = Math.max(0, this.originalImage.height - singleSubtitleHeight);
        const sourceHeight = Math.min(singleSubtitleHeight, this.originalImage.height - sourceY);

        subtitleLines.forEach((line, index) => {
            // 计算当前字幕的Y位置
            let yPosition;
            if (index === 0) {
                // 第一行字幕：覆盖在原图底部
                yPosition = this.originalImage.height - singleSubtitleHeight;
            } else {
                // 后续字幕：添加到下方
                yPosition = this.originalImage.height + (index - 1) * singleSubtitleHeight;
            }
            
            // 绘制图片段 - 所有字幕都使用原图的最底部同一段
            this.ctx.drawImage(
                this.originalImage,
                0, sourceY, this.originalImage.width, sourceHeight,  // 源区域：始终是图片最底部
                0, yPosition, this.previewCanvas.width, singleSubtitleHeight  // 目标区域
            );
            
            // 绘制分割线（除了第一行）
            if (index > 0) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // 白色分割线
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(0, yPosition);
                this.ctx.lineTo(this.previewCanvas.width, yPosition);
                this.ctx.stroke();
            }
            
            // 绘制字幕文字
            const textY = yPosition + singleSubtitleHeight / 2;
            const textX = this.previewCanvas.width / 2;
            
            // 绘制描边
            if (strokeWidth > 0) {
                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = strokeWidth;
                this.ctx.strokeText(line, textX, textY);
            }
            
            // 绘制填充文字
            this.ctx.fillStyle = fontColor;
            this.ctx.fillText(line, textX, textY);
        });
    }



    /**
     * 绘制水印
     */
    drawWatermark() {
        const watermarkText = this.watermarkText.value.trim();
        if (!watermarkText) return;

        const fontSize = this.getWatermarkFontSize(); // 使用固定的较大水印字体
        const fontFamily = 'Microsoft YaHei'; // 固定使用微软雅黑字体
        const fontColor = this.watermarkColor.value;
        const opacity = parseFloat(this.watermarkOpacity.value);

        // 设置字体样式
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';

        // 设置透明度
        this.ctx.globalAlpha = opacity;

        // 计算水印位置（右上角，留一些边距，只在原图区域内）
        const margin = fontSize * 0.6;
        const x = this.originalImage.width - margin;
        const y = margin;

        // 确保水印在原图范围内
        if (y < this.originalImage.height - fontSize) {
            // 绘制水印文字描边
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeText(watermarkText, x, y);

            // 绘制水印文字
            this.ctx.fillStyle = fontColor;
            this.ctx.fillText(watermarkText, x, y);
        }

        // 重置透明度
        this.ctx.globalAlpha = 1;
    }

    /**
     * 获取水印的固定字体大小（比字幕稍小）
     */
    getWatermarkFontSize() {
        const imageHeight = this.originalImage.height;
        const imageWidth = this.originalImage.width;
        const minDimension = Math.min(imageWidth, imageHeight);
        
        // 根据图片最小尺寸计算合适的水印字体大小（比字幕小一些）
        if (minDimension <= 400) {
            return 24;
        } else if (minDimension <= 600) {
            return 30;
        } else if (minDimension <= 800) {
            return 36;
        } else if (minDimension <= 1200) {
            return 42;
        } else {
            return 48;
        }
    }

    /**
     * 下载生成的图片
     */
    downloadImage() {
        if (!this.originalImage) {
            alert('请先上传图片并生成预览！');
            return;
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `字幕图片_${new Date().getTime()}.png`;
        link.href = this.previewCanvas.toDataURL('image/png', 1.0);
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('图片下载开始');
    }

    /**
     * 重置所有设置
     */
    resetAll() {
        if (confirm('确定要重置所有设置吗？这将清除当前的图片和所有文字内容。')) {
            // 清空图片
            this.originalImage = null;
            
            // 隐藏预览，显示占位符
            this.previewCanvas.style.display = 'none';
            this.previewPlaceholder.style.display = 'flex';
            this.imageInfo.style.display = 'none';
            
            // 清空文本内容
            this.subtitleText.value = '';
            this.watermarkText.value = '';
            
            // 重置样式设置为默认值
            this.subtitleColor.value = '#ffffff';
            this.subtitleStrokeColor.value = '#000000';
            this.subtitleStrokeWidth.value = 4;
            this.subtitleStrokeWidthValue.textContent = '4px';
            
            this.watermarkColor.value = '#ffffff';
            this.watermarkOpacity.value = 0.8;
            this.watermarkOpacityValue.textContent = '80%';
            
            // 禁用按钮
            this.generateBtn.disabled = true;
            this.downloadBtn.disabled = true;
            
            // 清空文件输入
            this.imageInput.value = '';
            
            console.log('所有设置已重置');
        }
    }
}

/**
 * 页面加载完成后初始化应用
 */
document.addEventListener('DOMContentLoaded', () => {
    // 创建应用实例
    const app = new ImageSubtitleGenerator();
    
    // 添加一些示例提示
    const subtitleText = document.getElementById('subtitleText');
    subtitleText.addEventListener('focus', function() {
        if (this.value === '') {
            this.placeholder = '例如：\n我这里看起来很美\n太阳像一只熟透的大橘子\n咬一口就会从牙齿甜到心里';
        }
    });
    
    subtitleText.addEventListener('blur', function() {
        this.placeholder = '请输入字幕内容，每行一句话...';
    });
    
    // 添加使用提示
    console.log(`
    🎉 图片字幕生成器使用指南：
    
    1. 📸 上传图片：点击或拖拽图片到上传区域
    2. ✍️  输入字幕：在文本框中输入多行字幕文字
    3. 🎨 调整样式：使用滑块和颜色选择器调整字幕样式
    4. 💧 添加水印：可选择在右上角添加水印文字
    5. 💾 下载图片：点击下载按钮保存处理后的图片
    
    ✨ 所有修改都会实时预览，非常方便！
    `);
});

/**
 * 错误处理 - 全局错误捕获
 */
window.addEventListener('error', (e) => {
    console.error('发生错误:', e.error);
    // 可以在这里添加用户友好的错误提示
});

/**
 * 导出到全局作用域（用于调试）
 */
window.ImageSubtitleGenerator = ImageSubtitleGenerator; 