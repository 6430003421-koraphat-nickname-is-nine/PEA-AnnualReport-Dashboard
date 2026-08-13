const SPREADSHEET_ID = "1-wKR79HyhLecFmHmIjlC4abIA6fF6fLDlyu7otsx8ME";

function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Admin Dashboard - ตรวจติดตามการส่งข้อมูล PEA")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * อ่าน Master Data แบบ Dynamic จาก 3 Sheets ใหม่
 */
function getMasterDataDynamic() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. อ่านข้อมูล รายชื่อฝ่าย (Sheet: Departments)
  const deptSheet = ss.getSheetByName("Departments");
  let deptList = [];
  if (deptSheet) {
    const values = deptSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][1]) deptList.push(String(values[i][1]).trim());
    }
  }

  // 2. อ่านข้อมูล รายชื่อหัวข้อ (Sheet: Topics)
  const topicSheet = ss.getSheetByName("Topics");
  let topicNames = {};
  if (topicSheet) {
    const values = topicSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      const id = String(values[i][0]).trim();
      const name = String(values[i][1]).trim();
      if (id) topicNames[id] = name;
    }
  }

  // 3. อ่านข้อมูล Mapping การรับผิดชอบ (Sheet: Mapping)
  const mapSheet = ss.getSheetByName("Mapping");
  let deptTopics = {};
  if (mapSheet) {
    const values = mapSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      const dept = String(values[i][0]).trim();
      const topicId = String(values[i][1]).trim();
      if (dept && topicId) {
        if (!deptTopics[dept]) deptTopics[dept] = [];
        deptTopics[dept].push(topicId);
      }
    }
  }

  return { deptList, topicNames, deptTopics };
}

/**
 * ดึงข้อมูล Dashboard ทั้งหมดโดยประมวลผลร่วมกับ Dynamic Sheet
 */
function getDashboardData(sortBy = "topic_first") {
  const master = getMasterDataDynamic();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ใช้ Sheet แผ่นแรก (Index 0) ซึ่งเป็น Sheet Submission เดิม ป้องกัน Portal พัง
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();

  const parseBool = (val) =>
    val === true ||
    val === 1 ||
    val === "1" ||
    String(val).toUpperCase() === "TRUE";

  // 1. รวมประวัติการส่งข้อมูลจาก Sheet เดิม
  const groupedSubmissions = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const topicId =
      row[0] !== "" && row[0] !== null ? String(row[0]).trim() : "";
    const dept = String(row[1] || "").trim();

    if (topicId && dept) {
      const key = `${topicId}_${dept}`;
      if (!groupedSubmissions[key]) groupedSubmissions[key] = [];

      let driveUrl = "";
      for (let c = 0; c < row.length; c++) {
        if (typeof row[c] === "string" && row[c].includes("drive.google.com")) {
          driveUrl = row[c];
          break;
        }
      }

      const rawDate = row[4] ? new Date(row[4]) : null;
      const isValidDate = rawDate && !isNaN(rawDate.getTime());

      groupedSubmissions[key].push({
        rowIndex: i + 1,
        correct: parseBool(row[2]),
        needEdit: parseBool(row[3]),
        rawTimestamp: isValidDate ? rawDate.getTime() : 0,
        timestamp: isValidDate
          ? Utilities.formatDate(rawDate, "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss")
          : "-",
        note: row[5] || "",
        phone: row[6] || "-",
        acknowledged: parseBool(row[7]),
        driveUrl: driveUrl,
        kpoStatus: String(row[10] || "").trim(),
        kpoNote: String(row[11] || "").trim(),
      });
    }
  }

  // 2. สร้าง Master List ตามรายการ Mapping ปัจจุบันใน Sheet
  const masterList = [];
  const topicNamesMap = master.topicNames || {};
  const deptTopicsMap = master.deptTopics || {};

  Object.keys(deptTopicsMap).forEach((deptName) => {
    const topicIds = deptTopicsMap[deptName];
    if (Array.isArray(topicIds)) {
      topicIds.forEach((id) => {
        const idStr = String(id).trim();
        const realName = topicNamesMap[idStr] || `หัวข้อที่ ${idStr}`;
        masterList.push({
          topicId: idStr,
          dept: String(deptName).trim(),
          topicName: realName,
        });
      });
    }
  });

  // 3. ประกอบข้อมูลเพื่อนำไปแสดงผลบน Dashboard
  let submittedCount = 0;
  let statusList = masterList.map((item) => {
    const key = `${item.topicId}_${item.dept}`;
    const submissions = groupedSubmissions[key] || [];
    submissions.sort((a, b) => b.rowIndex - a.rowIndex);

    const isSubmitted = submissions.length > 0;
    if (isSubmitted) submittedCount++;

    const latest = isSubmitted ? submissions[0] : null;

    return {
      topicId: item.topicId,
      dept: item.dept,
      topicName: item.topicName,
      isSubmitted: isSubmitted,
      latestSubmission: latest,
      versionHistory: submissions,
      totalVersions: submissions.length,
      lastTime: latest ? latest.rawTimestamp : 0,
      kpoStatus: latest ? latest.kpoStatus : "",
      kpoNote: latest ? latest.kpoNote : "",
    };
  });

  // 4. Sort ข้อมูล (ปรับแก้เพิ่มเงื่อนไขเรียงตามเวลาที่นี่)
  statusList.sort((a, b) => {
    const numA = parseInt(a.topicId) || 0;
    const numB = parseInt(b.topicId) || 0;
    const timeA = a.lastTime || 0;
    const timeB = b.lastTime || 0;

    if (sortBy === "dept_first") {
      const deptCompare = a.dept.localeCompare(b.dept, "th");
      return deptCompare !== 0 ? deptCompare : numA - numB;
    } else if (sortBy === "arrive_first") {
      // เก่าสุด ➔ ใหม่สุด (ส่งก่อนขึ้นก่อน / ยังไม่ส่งไว้ล่างสุด)
      if (timeA === 0 && timeB === 0) return numA - numB;
      if (timeA === 0) return 1;
      if (timeB === 0) return -1;
      return timeA - timeB;
    } else if (sortBy === "arrive_last") {
      // ใหม่สุด ➔ เก่าสุด (ส่งล่าสุดขึ้นก่อน / ยังไม่ส่งไว้ล่างสุด)
      if (timeA === 0 && timeB === 0) return numA - numB;
      if (timeA === 0) return 1;
      if (timeB === 0) return -1;
      return timeB - timeA;
    }

    // Default: topic_first (เรียงตามหัวข้อ ➔ ฝ่าย)
    return numA !== numB ? numA - numB : a.dept.localeCompare(b.dept, "th");
  });

  return {
    summary: {
      totalTasks: masterList.length,
      submittedCount: submittedCount,
      pendingCount: masterList.length - submittedCount,
      percentage:
        masterList.length > 0
          ? Math.round((submittedCount / masterList.length) * 100)
          : 0,
    },
    statusList: statusList,
    departments: master.deptList,
    allTopics: master.topicNames,
    deptMapping: master.deptTopics,
  };
}

/**
 * ฟังก์ชันสำหรับ Admin เพิ่ม/ลบ Mapping ผ่านหน้า Dashboard (ถ้าต้องการใช้งาน)
 */
function updateMappingRelation(action, dept, topicId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const mapSheet = ss.getSheetByName("Mapping");
    if (!mapSheet) return { success: false, message: "ไม่พบ Sheet 'Mapping'" };

    const data = mapSheet.getDataRange().getValues();

    if (action === "add") {
      mapSheet.appendRow([dept, topicId]);
      return {
        success: true,
        message: `เพิ่ม ${dept} ➔ หัวข้อ ${topicId} เรียบร้อย`,
      };
    } else if (action === "remove") {
      for (let i = data.length - 1; i >= 1; i--) {
        if (
          String(data[i][0]).trim() === String(dept).trim() &&
          String(data[i][1]).trim() === String(topicId).trim()
        ) {
          mapSheet.deleteRow(i + 1);
          return { success: true, message: `ลบการมอบหมายงานเรียบร้อย` };
        }
      }
      return { success: false, message: "ไม่พบรายการที่ต้องการลบ" };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function updateInspectionStatus(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    const rawData = sheet.getDataRange().getValues();
    let targetRowIndex = -1;

    for (let i = rawData.length - 1; i >= 1; i--) {
      if (
        String(rawData[i][0]).trim() === String(data.topicId).trim() &&
        String(rawData[i][1]).trim() === String(data.dept).trim()
      ) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1)
      return { success: false, message: "ไม่พบบรรทัดข้อมูลใน Sheet" };

    sheet.getRange(targetRowIndex, 11).setValue(data.kpoStatus || "");
    sheet.getRange(targetRowIndex, 12).setValue(data.kpoNote || "");

    return { success: true, message: "บันทึกการตรวจงานเรียบร้อยแล้ว" };
  } catch (err) {
    return { success: false, message: "เกิดข้อผิดพลาด: " + err.toString() };
  }
}

/**
 * บันทึกการเพิ่มหรือลบ Mapping จากหน้า Dashboard
 */
function updateMappingRelation(action, deptName, topicId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const mapSheet = ss.getSheetByName("Mapping");
    if (!mapSheet) return { success: false, message: "ไม่พบ Sheet 'Mapping'" };

    const data = mapSheet.getDataRange().getValues();
    const targetDept = String(deptName).trim();
    const targetTopic = String(topicId).trim();

    if (action === "remove") {
      // วนลูปจากล่างขึ้นบนเพื่อลบแถวที่ตรงกัน
      for (let i = data.length - 1; i >= 1; i--) {
        const rowDept = String(data[i][0]).trim();
        const rowTopic = String(data[i][1]).trim();

        if (rowDept === targetDept && rowTopic === targetTopic) {
          mapSheet.deleteRow(i + 1);
          return {
            success: true,
            message: `ลบความรับผิดชอบหัวข้อที่ ${targetTopic} ของฝ่าย ${targetDept} เรียบร้อยแล้ว`,
          };
        }
      }
      return { success: false, message: "ไม่พบข้อมูล Mapping รายการนี้" };
    }

    if (action === "add") {
      // เช็กก่อนว่ามี Mapping นี้อยู่แล้วหรือยัง เพื่อไม่ให้ซ้ำ
      for (let i = 1; i < data.length; i++) {
        if (
          String(data[i][0]).trim() === targetDept &&
          String(data[i][1]).trim() === targetTopic
        ) {
          return {
            success: false,
            message: `ฝ่าย ${targetDept} มีหัวข้อ ${targetTopic} อยู่แล้ว`,
          };
        }
      }

      mapSheet.appendRow([targetDept, targetTopic]);
      return {
        success: true,
        message: `เพิ่มหัวข้อที่ ${targetTopic} ให้ฝ่าย ${targetDept} เรียบร้อยแล้ว`,
      };
    }
  } catch (err) {
    return { success: false, message: "เกิดข้อผิดพลาด: " + err.toString() };
  }
}
