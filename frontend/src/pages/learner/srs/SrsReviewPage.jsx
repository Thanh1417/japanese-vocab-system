import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import {
    getDueSrsVocabulariesApi,
    submitSrsReviewApi,
} from "../../../api/srsApi";
import styles from "./SrsReviewPage.module.css";

function SrsReviewPage() {
    const [items, setItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMeaning, setShowMeaning] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchDueVocabularies = async () => {
        try {
            const res = await getDueSrsVocabulariesApi();
            setItems(res.data.data || res.data);
        } catch (error) {
            alert(error.response?.data?.message || "Không thể tải danh sách ôn tập");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (isCorrect) => {
        const currentItem = items[currentIndex];
        const vocab = currentItem.vocabulary || currentItem;

        try {
            await submitSrsReviewApi({
                vocabulary_id: vocab.vocabulary_id,
                is_correct: isCorrect,
            });

            setShowMeaning(false);
            setCurrentIndex((prev) => prev + 1);
        } catch (error) {
            alert(error.response?.data?.message || "Không thể lưu kết quả ôn tập");
        }
    };

    useEffect(() => {
        fetchDueVocabularies();
    }, []);

    const currentItem = items[currentIndex];
    const currentVocab = currentItem?.vocabulary || currentItem;
    const isFinished = !loading && currentIndex >= items.length;

    return (
        <MainLayout>
            <h1 className={styles.title}>Ôn tập SRS</h1>

            {loading && <p className={styles.message}>Đang tải dữ liệu...</p>}

            {!loading && items.length === 0 && (
                <p className={styles.message}>
                    Hôm nay bạn chưa có từ vựng nào cần ôn.
                </p>
            )}

            {isFinished && items.length > 0 && (
                <div className={styles.reviewCard}>
                    <h2>Hoàn thành ôn tập</h2>
                    <p>Bạn đã ôn xong {items.length} từ vựng hôm nay.</p>
                </div>
            )}

            {!loading && currentVocab && !isFinished && (
                <div className={styles.reviewCard}>
                    <p className={styles.progress}>
                        Từ {currentIndex + 1} / {items.length}
                    </p>

                    <h2 className={styles.word}>{currentVocab.word}</h2>

                    <p className={styles.info}>Cách đọc: {currentVocab.reading}</p>

                    {!showMeaning && (
                        <button
                            className={`${styles.button} ${styles.showButton}`}
                            onClick={() => setShowMeaning(true)}
                        >
                            Hiện nghĩa
                        </button>
                    )}

                    {showMeaning && (
                        <>
                            <p className={styles.info}>
                                Nghĩa: {currentVocab.vietnamese_meaning}
                            </p>

                            <p className={styles.info}>
                                Ví dụ: {currentVocab.example_sentence}
                            </p>

                            <div className={styles.actions}>
                                <button
                                    className={`${styles.button} ${styles.wrongButton}`}
                                    onClick={() => handleSubmitReview(false)}
                                >
                                    Sai
                                </button>

                                <button
                                    className={`${styles.button} ${styles.correctButton}`}
                                    onClick={() => handleSubmitReview(true)}
                                >
                                    Đúng
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </MainLayout>
    );
}

export default SrsReviewPage;