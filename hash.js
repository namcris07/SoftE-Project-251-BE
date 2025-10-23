import bcrypt from "bcrypt";

const main = async () => {
  const hashAdmin = await bcrypt.hash("admin123", 10);
  const hashTutor = await bcrypt.hash("tutor123", 10);
  const hashStudent = await bcrypt.hash("student123", 10);

  console.log("✅ Mã hoá mật khẩu thành công:\n");
  console.log("Admin:", hashAdmin);
  console.log("Tutor:", hashTutor);
  console.log("Student:", hashStudent);
};

main();
