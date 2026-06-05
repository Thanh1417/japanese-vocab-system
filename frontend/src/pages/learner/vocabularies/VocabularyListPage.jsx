import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { getAllVocabulariesApi } from "../../../api/vocabularyApi";
import styles from "./VocabularyListPage.module.css";
import VocabularyCard from "../../../components/vocabulary/VocabularyCard";

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
            <h1 className={styles.title}>Danh sách từ vựng</h1>

            <div className={styles.filterBox}>
                <input
                    className={styles.searchInput}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm từ, cách đọc hoặc nghĩa..."
                />

                <select
                    className={styles.select}
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
                <p className={styles.resultText}>
                    Tìm thấy <strong>{filteredVocabularies.length}</strong> từ vựng
                </p>
            )}

            {!loading && (
                <div className={styles.grid}>
                    {filteredVocabularies.map((vocab) => (
                        <VocabularyCard
                            key={vocab.vocabulary_id}
                            vocabulary={vocab}
                        />
                    ))}
                </div>
            )}
        </MainLayout>
    );
}

export default VocabularyListPage;