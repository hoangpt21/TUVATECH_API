export const slugify = (val) => {
  if (!val) return ''
  return String(val)
    .normalize('NFKD') // tách các ký tự có dấu thành các ký tự cơ bản và dấu phụ
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ tất cả các dấu, nằm trong khối UNICODE \u03xx
    .trim() // loại bỏ khoảng trắng ở đầu và cuối
    .toLowerCase() // chuyển thành chữ thường
    .replace(/[^a-z0-9 -]/g, '') // loại bỏ các ký tự không phải chữ cái hoặc số
    .replace(/\s+/g, '-') // thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // loại bỏ các dấu gạch ngang liên tiếp
}