import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { getAllVocabulariesApi } from "../../../api/vocabularyApi";

function VocabularyListPage() {
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <MainLayout>
      <h1>Danh sách từ vựng</h1>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {vocabularies.map((vocab) => (
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