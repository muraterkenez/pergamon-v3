/*
  # Tetikleyici Düzeltmeleri

  1. Değişiklikler
    - Mevcut tetikleyicileri kaldır
    - Yeni benzersiz isimlerle tekrar oluştur

  2. Güvenlik
    - Mevcut güvenlik politikaları korunacak
*/

-- Mevcut tetikleyicileri kaldır
DROP TRIGGER IF EXISTS update_breeding_records_updated_at ON breeding_records;
DROP TRIGGER IF EXISTS update_breeding_cycles_updated_at ON breeding_cycles;

-- Yeni benzersiz isimlerle tetikleyicileri oluştur
CREATE TRIGGER update_breeding_records_updated_at_v2
  BEFORE UPDATE ON breeding_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breeding_cycles_updated_at_v2
  BEFORE UPDATE ON breeding_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();