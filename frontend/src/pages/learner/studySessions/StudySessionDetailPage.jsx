import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import {
    getQuestionResultsBySessionApi,
    getStudySessionDetailApi,
} from "../../../api/studySessionApi";
import styles from "./StudySessionDetailPage.module.css";


function StudySessionDetailPage() {
    const { sessionId } = useParams();

    const [session, setSession] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        try {
            const sessionRes = await getStudySessionDetailApi(sessionId);
            setSession(sessionRes.data.data || sessionRes.data);

            const resultRes = await getQuestionResultsBySessionApi(sessionId);
            setResults(resultRes.data.data || resultRes.data);
        } catch (error) {
            alert("Không thể tải chi tiết phiên học");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [sessionId]);

    return (
        <MainLayout>
            <h1 className={styles.title}>Chi tiết phiên học</h1>

            {loading && <p className={styles.message}>Đang tải dữ liệu...</p>}

            {!loading && session && (
                <div className={styles.summaryCard}>
                    <p>ID phiên: {session.session_id}</p>
                    <p>Loại phiên: {session.session_type}</p>
                    <p>Số câu: {session.total_questions}</p>
                    <p>Câu đúng: {session.correct_answers}</p>
                </div>
            )}

            {!loading && results.length > 0 && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Câu hỏi</th>
                                <th>Từ vựng</th>
                                <th>Đáp án của bạn</th>
                                <th>Đáp án đúng</th>
                                <th>Kết quả</th>
                            </tr>
                        </thead>

                        <tbody>
                            {results.map((result) => (
                                <tr key={result.result_id}>
                                    <td>{result.question?.content}</td>
                                    <td>{result.question?.vocabulary?.word}</td>
                                    <td>{result.user_answer}</td>
                                    <td>{result.question?.correct_answer}</td>
                                    <td
                                        className={
                                            result.is_correct ? styles.correct : styles.wrong
                                        }
                                    >
                                        {result.is_correct ? "Đúng" : "Sai"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && results.length === 0 && (
                <p className={styles.message}>Phiên học này chưa có kết quả câu hỏi.</p>
            )}
        </MainLayout>
    );
}

export default StudySessionDetailPage;