const createAcronym = (fullName: string): string => {
  if (!fullName) {
    return "";
  }

  const normalize = (str: string): string => {
    return str
      .normalize("NFD") 
      .replace(/[\u0300-\u036f]/g, "") 
      .toUpperCase(); 
  };

  let normalizedName = normalize(fullName.trim());

  const prefixesToRemove = [
        /TP\.\s*/i,   // Loại bỏ "TP." (không phân biệt chữ hoa/thường)
        /Tỉnh\s*/i,   // Loại bỏ "Tỉnh "
        /Huyện\s*/i   // Loại bỏ "Huyện "
        // Thêm các tiền tố khác nếu cần
    ];

  prefixesToRemove.forEach(regex => {
      normalizedName = normalizedName.replace(regex, '');
  });

  if (normalizedName.includes("-")) {
    const parts = normalizedName.split("-").map(part => part.trim());

    const acronymParts = parts.map(part => {
      const words = part.split(/\s+/).filter(word => word.length > 0);
      
      return words.map(word => word.charAt(0)).join("");
    });

    return acronymParts.join("-");
  }

  const words = normalizedName.split(/\s+/).filter(word => word.length > 0);

  return words.map(word => word.charAt(0)).join("");
};

export default createAcronym;