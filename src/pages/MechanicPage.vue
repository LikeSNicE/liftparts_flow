<script setup lang="ts"></script>

<template>
  <div class="montazhnik-page">
    <h1>Кабинет Монтажника</h1>

    <div class="worker-sections">
      <div class="section">
        <h2>Мои заявки</h2>
        <div class="task-card">
          <strong>Заявка #1234</strong>
          <p>Установка лифта №5</p>
          <span class="status pending">В работе</span>
        </div>
        <div class="task-card">
          <strong>Заявка #1235</strong>
          <p>Техническое обслуживание</p>
          <span class="status completed">Выполнено</span>
        </div>
      </div>

      <div class="section">
        <h2>График работ</h2>
        <p>Понедельник - Пятница: 9:00 - 18:00</p>
        <button>Запросить выход</button>
      </div>

      <div class="section">
        <h2>Инструменты</h2>
        <button>Список инструментов</button>
        <button>Заказать расходники</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.montazhnik-page {
  padding: 20px;
}

.worker-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.section {
  padding: 20px;
  background: #d1ecf1;
  border: 2px solid #17a2b8;
  border-radius: 8px;
}

.section h2 {
  margin-top: 0;
  color: #0c5460;
}

.task-card {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
}

.task-card strong {
  display: block;
  color: #17a2b8;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-top: 8px;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.completed {
  background: #d4edda;
  color: #155724;
}

.section button {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  background: #17a2b8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: white;
}

.section button:hover {
  background: #138496;
}
</style>
