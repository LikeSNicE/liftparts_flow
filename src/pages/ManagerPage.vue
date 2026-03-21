<script setup lang="ts">
</script>

<template>
  <div class="manager-page">
    <h1>📋 Кабинет Менеджера</h1>
    <p>Доступно пользователям с ролью manager</p>
    
    <div class="manager-sections">
      <div class="section">
        <h2>Заказы</h2>
        <button>+ Новый заказ</button>
        <div class="order-card">
          <strong>Заказ #5678</strong>
          <p>Клиент: ООО "СтройКомплекс"</p>
          <p>Сумма: 150 000 ₽</p>
          <span class="status in-progress">В работе</span>
        </div>
      </div>
      
      <div class="section">
        <h2>Монтажники</h2>
        <button>Назначить на объект</button>
        <button>Контроль работ</button>
        <div class="worker-list">
          <div class="worker-item">
            <span>👤 Иванов А.П.</span>
            <span class="status busy">Занят</span>
          </div>
          <div class="worker-item">
            <span>👤 Петров Б.С.</span>
            <span class="status free">Свободен</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>Клиенты</h2>
        <button>Добавить клиента</button>
        <button>База клиентов</button>
      </div>
      
      <div class="section">
        <h2>Статистика</h2>
        <p>Заказов за месяц: 24</p>
        <p>Выручка: 1 200 000 ₽</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manager-page {
  padding: 20px;
}

.manager-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.section {
  padding: 20px;
  background: #d4edda;
  border: 2px solid #28a745;
  border-radius: 8px;
}

.section h2 {
  margin-top: 0;
  color: #155724;
}

.section button {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  background: #28a745;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: white;
}

.section button:hover {
  background: #218838;
}

.order-card {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
}

.order-card strong {
  display: block;
  color: #28a745;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-top: 8px;
}

.status.in-progress {
  background: #fff3cd;
  color: #856404;
}

.worker-list {
  margin-top: 10px;
}

.worker-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: white;
  border-radius: 4px;
  margin: 5px 0;
}

.worker-item .status {
  margin-top: 0;
}

.worker-item .status.busy {
  background: #f8d7da;
  color: #721c24;
}

.worker-item .status.free {
  background: #d4edda;
  color: #155724;
}
</style>
