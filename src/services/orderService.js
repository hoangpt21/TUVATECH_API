import { StatusCodes } from "http-status-codes"
import { orderModel } from "../models/orderModel"
import ApiError from "../utils/ApiError"
import { BrevoProvider } from "../providers/BrevoProvider";
import { WEBSITE_DOMAIN } from "../utils/constants";
import { orderItemModel } from "../models/orderItemModel";


const list_all_orders = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const orders = await orderModel.list_all_orders(selectedColumns, limit, offset);
        return orders;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách đơn hàng");
    }
}

const get_order_by_id = async (orderId, selectedColumns = ["*"]) => {
    try {
        const [order] = await orderModel.list_orders_by_conditions(
            [orderId],
            selectedColumns,
            [{ name: "order_id" }]
        );

        if (!order) return null;

        return order;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin đơn hàng");
    }
}

const get_orders_by_user = async (userId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const orders = await orderModel.list_orders_by_conditions(
            [userId],
            selectedColumns,
            [{ name: "user_id" }],
            limit,
            offset,
            false
        );
        return orders;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách đơn hàng của người dùng");
    }
}

const create_an_order = async (orderData) => {
    try {
        const createdOrder = await orderModel.create_an_order(orderData);
        const [newOrder] = await orderModel.list_orders_by_conditions(
            [createdOrder.insertId],
            ["*"],
            [{ name: "order_id" }]
        );
        return newOrder;
    } catch (error) {
        console.error("Error creating order:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo đơn hàng mới");
    }
}

const update_order_status = async (orderId, newStatus, adminId, selectedColumns = ["*"]) => {
    try {
        const [existingOrder] = await orderModel.list_orders_by_conditions(
            [orderId],
            ["*"],
            [{ name: "order_id" }]
        );

        if (!existingOrder) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đơn hàng hoặc bạn không có quyền cập nhật");
        }

        if(newStatus === "cancelled" && existingOrder.payment_status === "paid") {
            await orderModel.update_an_order(
                [newStatus,'refund', orderId], 
                ["status","payment_status"],    
                [{ name: "order_id" }]
            );
        } else{
            if(newStatus === "delivered" && existingOrder.payment_status === "pending") {
                await orderModel.update_an_order(
                    [newStatus,'paid', orderId], 
                    ["status","payment_status"],    
                    [{ name: "order_id" }]
                );
            } else await orderModel.update_an_order(
                [newStatus, orderId], 
                ["status"],    
                [{ name: "order_id" }]
            ); 
            const orderLink = existingOrder.user_id === adminId ?
             `${WEBSITE_DOMAIN}/admin/info/orderhistory`: `${WEBSITE_DOMAIN}/tmember/orderhistory`;
            if(newStatus === "confirmed") {
                const customSubject = "TuvaTech - ĐƠN HÀNG CỦA BẠN ĐÃ ĐƯỢC XÁC NHẬN";
                const htmlContent = `
                    <h3>Đơn hàng #${existingOrder.order_id} đã được xác nhận<h3>
                    <a href=${orderLink}>XEM ĐƠN HÀNG<a>
                `;
                BrevoProvider.sendEmail(existingOrder.recipient_email, customSubject, htmlContent).catch((err) => {
                    console.error("Lỗi gửi email qua Brevo:", err)
                });;
            } else if(newStatus === "delivered") {
                const paymentStatuses = {
                    pending: { text: 'Chưa thanh toán', color: 'orange' },
                    paid: { text: 'Đã thanh toán', color: 'green' },
                    failed: { text: 'Thanh toán thất bại', color: 'red' }
                };
                const customSubject = `TuvaTech | ĐƠN HÀNG #${existingOrder.order_id} THÀNH CÔNG`;
                const orderDetails = await orderItemModel.list_order_items_by_conditions([orderId], ["*"],  [{name: "order_id"}])
                const htmlContent = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #eee; padding: 24px;">
                    <div style="text-align:center; margin-bottom: 24px;">
                      <img src="https://img.icons8.com/color/96/000000/checked--v2.png" alt="success" style="width:80px; margin-bottom: 12px;" />
                      <h2 style="margin: 0 0 8px 0; font-size: 28px; color: #222;">Đặt hàng thành công</h2>
                      <p style="color: #444; font-size: 16px;">Cảm ơn bạn đã đặt hàng, chúng tôi sẽ gửi sản phẩm đến bạn trong thời gian ngắn nhất.</p>
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="${orderLink}" 
                        style="
                          background-color:  #1890ff;
                          color: white;
                          padding: 14px 28px;
                          text-decoration: none;
                          border-radius: 8px;
                          font-weight: 600;
                          font-size: 15px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
                          transition: all 0.3s ease;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          border: 2px solid transparent;
                        "
                        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(24, 144, 255, 0.4)'"
                        onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(24, 144, 255, 0.3)'"
                      >XEM ĐƠN HÀNG</a>
                    </div>
                    <div style="border:1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                      ${orderDetails.map(item => `
                      <div style="display:flex; margin-bottom:16px;">
                        <div style="flex-shrink:0; margin-right: 16px">
                          <img src="${item?.thumbnail || ''}" alt="product" style="width:80px; height:80px; object-fit:contain; border-radius:8px;" />
                        </div>
                        <div style="flex-grow:1;">
                          <div style="font-weight:600; font-size:16px; margin-bottom:4px;">${item?.product_name || ''}</div>
                          <div style="color:#888; font-size:14px; margin-bottom:4px">Số lượng: ${item?.quantity || 1}</div>
                          <div style="color:#888; font-size:14px;">Thành tiền: ${new Intl.NumberFormat('vi-VN', {style: 'currency',currency: 'VND'}).format(item?.subtotal_price)}</div>
                        </div>
                      </div>
                      `).join('')}
                      <div style="border-top:1px solid #eee; margin:12px 0;"></div>
                      <div style="display:flex; justify-content:space-between; font-size:15px; margin-bottom:4px">
                        <span>Tổng tiền sản phẩm:</span>
                        <span style="font-weight:600;">${new Intl.NumberFormat('vi-VN', {style: 'currency',currency: 'VND'}).format(Number(existingOrder.total_price) + Number(existingOrder.discount_amount) - Number(existingOrder.shipping_fee))}</span>
                      </div>
                      <div style="display:flex; justify-content:space-between; font-size:15px; margin-bottom:4px">
                        <span>Phí vận chuyển:</span>
                        <span style="font-weight:600;">${new Intl.NumberFormat('vi-VN', {style: 'currency',currency: 'VND'}).format(existingOrder.shipping_fee)}</span>
                      </div>
                      <div style="display:flex; justify-content:space-between; font-size:15px; margin-bottom:4px">
                        <span>Giảm giá:</span>
                        <span style="font-weight:600;">${new Intl.NumberFormat('vi-VN', {style: 'currency',currency: 'VND'}).format(existingOrder.discount_amount  || 0)}</span>
                      </div>
                      <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:700; margin-top:8px; margin-bottom:4px">
                        <span>Tổng thanh toán:</span>
                        <span>${new Intl.NumberFormat('vi-VN', {style: 'currency',currency: 'VND'}).format(existingOrder.total_price)}</span>
                      </div>
                      <div style="display:flex; justify-content:space-between; font-size:15px; margin-top:4px;">
                        <span>Trạng thái:</span>
                        <span style="color: ${paymentStatuses[existingOrder?.payment_status].color}; font-weight:600;">${paymentStatuses[existingOrder?.payment_status].text}</span>
                      </div>
                    </div>
                    <div style="font-size:15px; margin-bottom: 8px;">
                      <b>Họ và tên:</b> ${existingOrder.recipient_full_name || ''}
                    </div>
                    <div style="font-size:15px; margin-bottom: 8px;">
                      <b>Mã đơn hàng:</b> #${existingOrder.order_id}
                    </div>
                    <div style="font-size:15px; margin-bottom: 8px;">
                      <b>Ngày đặt hàng:</b> ${existingOrder.order_date ? new Date(existingOrder.order_date).toLocaleString('vi-VN') : ''}
                    </div>
                    <div style="font-size:15px; margin-bottom: 8px;">
                      <b>Phương thức thanh toán:</b> ${existingOrder.payment_method || ''}
                    </div>
                    <div style="font-size:15px; margin-bottom: 8px;">
                      <b>Địa chỉ nhận hàng:</b> ${existingOrder.recipient_full_address || ''}
                    </div>
                    <div style="text-align: center; margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                      <p style="margin: 0; color: #666; font-size: 14px;">
                        Bạn cần hỗ trợ? Email hỗ trợ <a href="mailto:support@tuvatech.vn" style="color: #1890ff; text-decoration: none;">support@tuvatech.vn</a> hoặc gọi hotline <a href="tel:18004060" style="color: #1890ff; text-decoration: none;">1800 4060</a>
                      </p>
                    </div>
                  </div>
                `;
                BrevoProvider.sendEmail(existingOrder.recipient_email, customSubject, htmlContent).catch((err) => {
                    console.error("Lỗi gửi email qua Brevo:", err);
                });;
            }
        }

        const [updatedOrder] = await orderModel.list_orders_by_conditions(
            [orderId],
            selectedColumns,
            [{ name: "order_id" }]
        );

        return updatedOrder;
    } catch (error) {
        console.error("Error updating order:", error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật trạng thái đơn hàng");
    }
}

const update_an_order = async (orderId, userId, updateData) => {
    try {
        const [existingOrder] = await orderModel.list_orders_by_conditions(
            [orderId, userId],
            ["order_id"],
            [{ name: "order_id", logicalOperator: "AND" }, { name: "user_id" }]
        );

        if (!existingOrder) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đơn hàng hoặc bạn không có quyền cập nhật");
        }

        // Filter out updated_at as it's handled by the database
        const filteredUpdateData = { ...updateData };
        delete filteredUpdateData.updated_at;

        const columnsToUpdate = Object.keys(filteredUpdateData);
        // Ensure there are columns to update after filtering
        if (columnsToUpdate.length > 0) {
            const values = [...columnsToUpdate.map(key => filteredUpdateData[key]), orderId];
            await orderModel.update_an_order(
                values,
                columnsToUpdate,
                [{ name: "order_id" }]
            );
        }

        const [updatedOrder] = await orderModel.list_orders_by_conditions(
            [orderId],
            ["*"],
            [{ name: "order_id" }]
        );

        return updatedOrder;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật đơn hàng");
    }
}

const delete_an_order = async (orderId) => {
    try {
        const [existingOrder] = await orderModel.list_orders_by_conditions(
            [orderId],
            ["order_id", "status"],
            [{ name: "order_id" }]
        );

        if (!existingOrder) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đơn hàng hoặc bạn không có quyền xóa");
        }

        if (existingOrder.status !== 'cancelled') {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Chỉ có thể xóa đơn hàng ở trạng thái đã hủy");
        }

        await orderModel.delete_an_order(orderId);
        return { message: "Xóa đơn hàng thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Đơn hàng đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa đơn hàng");
    }
}

export const orderService = {
    list_all_orders,
    get_order_by_id,
    get_orders_by_user,
    create_an_order,
    update_order_status,
    update_an_order,
    delete_an_order
};