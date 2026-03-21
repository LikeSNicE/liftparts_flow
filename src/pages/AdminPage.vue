<script setup lang="ts">
</script>

<template>
  <div class="admin-page">
    <h1>👑 Панель Администратора</h1>
    <p>Доступно только пользователям с ролью admin</p>
    
    <div class="admin-sections">
      <div class="section">
        <h2>Управление пользователями</h2>
        <button>Добавить пользователя</button>
        <button>Удалить пользователя</button>
        <button>Редактировать права</button>
      </div>
      
      <div class="section">
        <h2>Настройки системы</h2>
        <button>Общие настройки</button>
        <button>Безопасность</button>
        <button>Логирование</button>
      </div>
      
      <div class="section">
        <h2>Финансы</h2>
        <button>Отчеты</button>
        <button>Платежи</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 20px;
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.section {
  padding: 20px;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
}

.section h2 {
  margin-top: 0;
  color: #856404;
}

.section button {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  background: #ffc107;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.section button:hover {
  background: #e0a800;
}
</style>
