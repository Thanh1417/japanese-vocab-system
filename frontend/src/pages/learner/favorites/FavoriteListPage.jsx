import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import {
  getMyFavoritesApi,
  removeFavoriteVocabularyApi,
} from "../../../api/favoriteApi";
import styles from "./FavoriteListPage.module.css";


function FavoriteListPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await getMyFavoritesApi();
      setFavorites(res.data.data || res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (vocabularyId) => {
    if (!window.confirm("Bạn có chắc muốn xoá từ này khỏi yêu thích không?")) {
      return;
    }

    try {
      await removeFavoriteVocabularyApi(vocabularyId);
      alert("Đã xoá khỏi yêu thích");
      fetchFavorites();
    } catch (error) {
      alert(error.response?.data?.message || "Xoá yêu thích thất bại");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <MainLayout>
        <h1 className={styles.title}>Từ vựng yêu thích</h1>

        {loading && <p className={styles.message}>Đang tải dữ liệu...</p>}

        {!loading && favorites.length === 0 && (
        <p className={styles.message}>Bạn chưa có từ vựng yêu thích nào.</p>
        )}

        {!loading && favorites.length > 0 && (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
            <thead>
                <tr>
                <th>Từ vựng</th>
                <th>Cách đọc</th>
                <th>Nghĩa tiếng Việt</th>
                <th>JLPT</th>
                <th>Thao tác</th>
                </tr>
            </thead>

            <tbody>
                {favorites.map((item) => {
                const vocab = item.vocabulary || item;

                return (
                    <tr key={vocab.vocabulary_id}>
                    <td>{vocab.word}</td>
                    <td>{vocab.reading}</td>
                    <td>{vocab.vietnamese_meaning}</td>
                    <td>{vocab.jlpt_level}</td>
                    <td>
                        <button
                        className={styles.deleteButton}
                        onClick={() =>
                            handleRemoveFavorite(vocab.vocabulary_id)
                        }
                        >
                        Xoá khỏi yêu thích
                        </button>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
        )}
    </MainLayout>
    );
}

export default FavoriteListPage;