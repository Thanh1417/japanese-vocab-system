# 1. Sử dụng môi trường Node.js (bản 18 hoặc 20 tùy bạn đang dùng)
FROM node:22-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json và package-lock.json vào trước để cài npm
COPY package*.json ./

# 4. Cài đặt các thư viện (node_modules)
RUN npm install

# 5. Copy toàn bộ code backend còn lại vào container
COPY . .

# (Tùy chọn) Nếu bạn đang dùng Prisma làm ORM, hãy bỏ comment dòng dưới đây:
# RUN npx prisma generate

# 6. Mở cổng 5000 (hoặc cổng mà file Express của bạn đang chạy)
EXPOSE 5000

# 7. Lệnh khởi chạy ứng dụng
CMD ["npm", "start"] 
# Lưu ý: Thay "npm start" bằng lệnh chạy thực tế trong package.json của bạn (vd: "node index.js")
