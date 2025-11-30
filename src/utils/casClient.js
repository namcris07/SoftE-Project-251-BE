import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Hàm helper get/post giữ nguyên logic của bạn nhưng tối ưu header
async function getWithCookies(url, jar) {
    const cookieHeader = await jar.getCookieString(url);
    return axios.get(url, {
        headers: { 
            Cookie: cookieHeader,
            "User-Agent": USER_AGENT,
        },
        validateStatus: () => true 
    }).then(async res => {
        if (res.headers["set-cookie"]) {
            await Promise.all(res.headers["set-cookie"].map(c => jar.setCookie(c, url)));
        }
        return res;
    });
}

async function postWithCookies(url, data, jar) {
    const cookieHeader = await jar.getCookieString(url);
    return axios.post(url, data, {
        headers: {
            Cookie: cookieHeader,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": USER_AGENT,
        },
        maxRedirects: 0, // Quan trọng: Không tự động redirect để bắt status 302
        validateStatus: () => true
    }).then(async res => {
        if (res.headers["set-cookie"]) {
            await Promise.all(res.headers["set-cookie"].map(c => jar.setCookie(c, url)));
        }
        return res;
    });
}

export async function checkCAS(username, password) {
    const jar = new CookieJar();
    const loginUrl = "https://sso.hcmut.edu.vn/cas/login";

    try {
        console.log(`[CAS] Bắt đầu xác thực cho: ${username}`);

        // BƯỚC 1: Lấy trang login để lấy token "lt" và "execution"
        const getPage = await getWithCookies(loginUrl, jar);
        const $ = cheerio.load(getPage.data);
        
        const lt = $('input[name="lt"]').val();
        const execution = $('input[name="execution"]').val();

        if (!lt || !execution) {
            console.error("[CAS] Lỗi: Không lấy được token (lt/execution). Cấu trúc trang web có thể đã thay đổi.");
            return false;
        }

        // BƯỚC 2: Submit form
        const body = new URLSearchParams({
            username,
            password,
            lt,
            execution,
            _eventId: "submit",
            submit: "Login"
        });

        const postRes = await postWithCookies(loginUrl, body, jar);
        
        // BƯỚC 3: Kiểm tra kết quả
        // Cách 1: Kiểm tra Cookie CASTGC (Độ tin cậy cao nhất)
        const cookies = await jar.getCookies(loginUrl);
        const hasCASTGC = cookies.some(c => c.key === "CASTGC");
        if (hasCASTGC) {
            console.log("[CAS] Login Success (Phát hiện CASTGC)");
            return true;
        }

        // Cách 2: Kiểm tra Header Location (Nếu đăng nhập thành công thường sẽ redirect)
        if (postRes.status === 302 && postRes.headers.location) {
             // Thường nếu redirect về chính nó hoặc trang success
            console.log("[CAS] Login Success (Phát hiện Redirect 302)");
            return true;
        }

        // Cách 3: Phân tích HTML trả về
        const html = postRes.data;
        if (html.includes("Log In Successful") || html.includes("Đăng nhập thành công")) {
            console.log("[CAS] Login Success (Khớp văn bản)");
            return true;
        }

        if (html.includes('class="errors"') || html.includes("credentials you provided cannot be determined")) {
            console.log("[CAS] Thất bại: Sai mật khẩu hoặc tài khoản.");
            return false;
        }

        console.log(`[CAS] Phản hồi không xác định. Status: ${postRes.status}`);
        return false;

    } catch (error) {
        console.error("[CAS] Lỗi hệ thống:", error.message);
        return false;
    }
}