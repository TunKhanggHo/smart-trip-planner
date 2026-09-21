<?php
set_time_limit(120); 
ini_set('max_execution_time', '120');
// API kết nối Google Gemini AI tự động sinh lịch trình du lịch

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/secrets.php';

$GEMINI_API_KEY = getenv('GEMINI_API_KEY') ?: GEMINI_API_KEY;

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true) ?: $_POST;

$destName = isset($data['destinationName']) ? $data['destinationName'] : 'Đà Lạt';
$city = isset($data['city']) ? $data['city'] : 'Lâm Đồng';
$days = isset($data['days']) ? (int)$data['days'] : 3;
$people = isset($data['people']) ? (int)$data['people'] : 2;
$budget = isset($data['userBudget']) ? (int)$data['userBudget'] : 2500000;
$style = isset($data['style']) ? $data['style'] : 'chill';
$vehicle = isset($data['vehicle']) ? $data['vehicle'] : 'xe máy';

$styleDesc = "nghỉ dưỡng thư giãn, ngắm cảnh đẹp, cà phê chill";
if ($style === 'adventure') {
    $styleDesc = "khám phá mạo hiểm, phượt các cung đường hùng vĩ, trải nghiệm cảm giác mạnh";
} elseif ($style === 'foodie') {
    $styleDesc = "thiên đường ẩm thực, food tour thưởng thức các món ăn đặc sản địa phương ngon nhất";
}

$prompt = "Bạn là chuyên gia tư vấn du lịch Việt Nam hàng đầu.
Hãy thiết kế một lịch trình du lịch chi tiết và hoàn toàn khác biệt cho từng ngày tại: {$destName} ({$city}).
Thông tin chuyến đi:
- Thời gian: {$days} ngày ({$days} ngày " . ($days - 1) . " đêm).
- Số lượng người: {$people} người.
- Phương tiện di chuyển: {$vehicle}.
- Phong cách chuyến đi: {$styleDesc}.
- Tổng ngân sách dự kiến: " . number_format($budget, 0, ',', '.') . " VNĐ / người.

YÊU CẦU BẮT BUỘC:
1. Mỗi ngày phải gồm đúng 4 buổi: Sáng (07:00 - 11:30), Trưa (11:30 - 13:30), Chiều (14:30 - 17:30), Tối (18:30 - 22:00).
2. Tên các địa danh, quán ăn, món ăn phải có thật 100% tại {$city} và phù hợp với phong cách {$style}.
3. Phân bổ chi phí dự tính hợp lý bằng số nguyên VNĐ cho từng hoạt động sao cho tổng chi phí xấp xỉ ngân sách {$budget} VNĐ.
4. Trả về KẾT QUẢ DUY NHẤT LÀ MÃ JSON KHÔNG KÈM BẤT KỲ LỜI MỞ ĐẦU HAY GIẢI THÍCH NÀO.
5. Tuyệt đối KHÔNG gợi ý dịch vụ 'thuê xe máy' nếu phương tiện là xe máy phượt cá nhân.

CẤU TRÚC JSON MẪU:
{
  \"destinationName\": \"{$destName}\",
  \"totalCostPerPerson\": {$budget},
  \"schedule\": [
    {
      \"dayNumber\": 1,
      \"dayTitle\": \"Khám phá trung tâm & Chào đón\",
      \"dayTotal\": 750000,
      \"activities\": [
        { \"time\": \"Sáng (07:00 - 11:30)\", \"title\": \"Tên địa điểm và trải nghiệm cụ thể...\", \"cost\": 250000 },
        { \"time\": \"Trưa (11:30 - 13:30)\", \"title\": \"Tên quán ăn và món đặc sản trưa...\", \"cost\": 150000 },
        { \"time\": \"Chiều (14:30 - 17:30)\", \"title\": \"Tên điểm tham quan hoặc quán cà phê chiều...\", \"cost\": 150000 },
        { \"time\": \"Tối (18:30 - 22:00)\", \"title\": \"Hoạt động ăn tối, dạo phố đêm...\", \"cost\": 200000 }
      ]
    }
  ]
}";

$listUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" . urlencode($GEMINI_API_KEY);
$ch = curl_init($listUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$listResponse = curl_exec($ch);
$listHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$listCurlError = curl_error($ch);
curl_close($ch);

$availableModels = [];
$listData = json_decode($listResponse, true);
if ($listHttp === 200 && isset($listData['models'])) {
    foreach ($listData['models'] as $m) {
        if (isset($m['supportedGenerationMethods']) && in_array('generateContent', $m['supportedGenerationMethods'])) {
            $availableModels[] = $m['name'];
        }
    }
}

if (empty($availableModels)) {
    $availableModels = [
        "models/gemini-1.5-flash-latest",
        "models/gemini-1.5-flash",
        "models/gemini-2.0-flash",
        "models/gemini-pro"
    ];
}

$postData = [
    "contents" => [
        [
            "parts" => [["text" => $prompt]]
        ]
    ],
    "generationConfig" => [
        "temperature" => 0.7,
        "maxOutputTokens" => 2048,
        "responseMimeType" => "application/json"
    ]
];

$lastAttempts = [];

foreach ($availableModels as $modelPath) {
    $generateUrl = "https://generativelanguage.googleapis.com/v1beta/" . $modelPath . ":generateContent?key=" . urlencode($GEMINI_API_KEY);
    
    $ch = curl_init($generateUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resJson = json_decode($response, true);
        if (isset($resJson['candidates'][0]['content']['parts'][0]['text'])) {
            $rawText = $resJson['candidates'][0]['content']['parts'][0]['text'];
            $cleaned = preg_replace('/^```json\s*|\s*```$/i', '', trim($rawText));
            $scheduleData = json_decode($cleaned, true);

            if ($scheduleData && isset($scheduleData['schedule'])) {
                echo json_encode([
                    "status" => "success",
                    "source" => "gemini_ai",
                    "model_used" => $modelPath,
                    "message" => "Tạo lịch trình thành công từ Google Gemini AI!",
                    "data" => $scheduleData
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }
        }
    }

    $lastAttempts[] = [
        "model" => $modelPath,
        "http_code" => $httpCode,
        "curl_error" => $curlError ?: null,
        "response_snippet" => $response ? substr($response, 0, 300) : null
    ];
}

http_response_code(500);
echo json_encode([
    "status" => "error",
    "message" => "Không thể kết nối đến Gemini AI. Vui lòng kiểm tra lại mạng!",
    "available_models" => $availableModels,
    "debug_attempts" => $lastAttempts,
    "models_list_http_code" => $listHttp,
    "models_list_curl_error" => $listCurlError ?: null,
    "models_list_response_snippet" => $listResponse ? substr($listResponse, 0, 300) : null
], JSON_UNESCAPED_UNICODE);