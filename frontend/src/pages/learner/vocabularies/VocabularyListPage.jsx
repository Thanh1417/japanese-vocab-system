import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { getAllVocabulariesApi } from "../../../api/vocabularyApi";

function VocabularyListPage() {
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [jlptLevel, setJlptLevel] = useState("");

  const fetchVocabularies = async () => {
    try {
      const res = await getAllVocabulariesApi();
      setVocabularies(res.data.data || res.data);
    } catch (error) {
      console.log(error);
      alert("Không thể tải danh sách từ vựng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularies();
  }, []);

  const filteredVocabularies = vocabularies.filter((vocab) => {
    const matchKeyword =
      vocab.word?.toLowerCase().includes(keyword.toLowerCase()) ||
      vocab.reading?.toLowerCase().includes(keyword.toLowerCase()) ||
      vocab.vietnamese_meaning
        ?.toLowerCase()
        .includes(keyword.toLowerCase());

    const matchLevel = jlptLevel ? vocab.jlpt_level === jlptLevel : true;

    return matchKeyword && matchLevel;
  });

  return (
    <MainLayout>
      <h1>Danh sách từ vựng</h1>

      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
        }}
      >
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm từ, cách đọc hoặc nghĩa..."
          style={{ flex: 1 }}
        />

        <select
          value={jlptLevel}
          onChange={(e) => setJlptLevel(e.target.value)}
        >
          <option value="">Tất cả cấp độ</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <p>
          Tìm thấy <strong>{filteredVocabularies.length}</strong> từ vựng
        </p>
      )}

      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {filteredVocabularies.map((vocab) => (
            <div
              key={vocab.vocabulary_id}
              style={{
                background: "white",
                padding: "18px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2>{vocab.word}</h2>
              <p>Đọc: {vocab.reading}</p>
              <p>Nghĩa: {vocab.vietnamese_meaning}</p>
              <p>JLPT: {vocab.jlpt_level}</p>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default VocabularyListPage;