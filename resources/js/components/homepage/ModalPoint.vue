<template>
    <div class="cstm-modal-container">
        <el-form :rules="rules" :model="ruleForm" status-icon ref="ruleForm" >
                <span class="cstm-header">Добавление карточки</span>
                <el-form-item prop="name">
                    <el-input placeholder="Введите название" v-model="ruleForm.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item prop="category">
                    <el-select v-model="ruleForm.category">
                        <el-option label="Доход" value="Доход" style="color: #ffffff"></el-option>
                        <el-option label="Счета" value="Счета" style="color: #ffffff"></el-option>
                        <el-option label="Расход" value="Расход" style="color: #ffffff"></el-option>
                    </el-select>
                    <el-switch v-if="(ruleForm.category === 'Счета')" v-model="ruleForm.balance" class="cstm-switch-margin"></el-switch>
                    <span v-if="(ruleForm.category === 'Счета')" class="cstm-switch-text">Учитывать в общем балансе</span>
                </el-form-item>
                <span v-if="(ruleForm.category === 'Расход')" class="cstm-amount">Планирую потратить</span>
                <el-form-item v-if="(ruleForm.category === 'Расход')">
                    <el-input-number v-model="ruleForm.amount" :min="0" :step="500"></el-input-number>
                </el-form-item>
                <span v-if="(ruleForm.category === 'Счета')" class="cstm-amount">Баланс</span>
                <el-form-item v-if="(ruleForm.category === 'Счета')">
                    <el-input-number v-model="ruleForm.amount" :min="0" :step="500"></el-input-number>
                </el-form-item>
                <br>
                <div align="center" style="overflow: auto; max-height: 40vh">
                    <el-form-item prop="choose">
                        <el-radio-group v-model="ruleForm.choose">
                            <el-radio-button
                                style="color: #3d3e48;"
                                class="cstm-radio-gap"
                                :label="elem.id"
                                v-for="elem in allIcons"
                                :key="elem.id"
                            >
                                <i :class="elem.name" class="cstm-icon-size"></i>
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </div>
                <br>
                <el-form-item align="center">
                    <el-button @click="cancelForm">Отмена</el-button>
                    <el-button type="primary" @click="submitForm('ruleForm')">Подтвердить</el-button>
                </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import axios from 'axios'

    export default {
        props: ['category'],
        data() {
            return {
                errors: [],
                dialogVisible: false,
                ruleForm: {
                    category: this.category,
                    name: '',
                    choose: '',
                    balance: true,
                    amount: 0
                },
                rules: {
                    name: [
                        {required: true, message: 'Введите название', trigger: 'blur'},
                    ],
                    choose: [
                        {required: true, message: 'Выберите картинку', trigger: 'change'},
                    ]
                }
            };
        },
        computed:
            mapGetters(['allIcons', 'intervalMonth',]),
        mounted() {
            if (!this.allIcons.length) this.fetchIcons()
        },
        methods: {
            ...mapActions(['fetchIcons', 'fetchIncomes', 'fetchWallets', 'fetchExpenses']),

            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.isBalance();
                        // Incomes
                        if (this.ruleForm.category === 'Доход'){
                            axios.post('/api/incomes' , {
                                name: this.ruleForm.name,
                                icon_id: this.ruleForm.choose
                            }).then(response => {
                                    this.fetchIncomes({
                                        dateFrom: this.intervalMonth.dateFrom,
                                        dateTo: this.intervalMonth.dateTo,
                                    })
                                    this.successForm()
                                })
                                .catch((error) => {
                                    this.errors.push(error.response.data.errors.name[0])
                                    this.MessageArrayErrors(this.errors)
                                })
                            }
                        // Wallets
                        if (this.ruleForm.category === 'Счета'){
                            axios.post('/api/wallets', {
                                name: this.ruleForm.name,
                                amount: this.ruleForm.amount,
                                include: this.ruleForm.balance,
                                icon_id: this.ruleForm.choose
                            }).then( response => {
                                this.fetchWallets()
                                this.successForm()
                            }).catch( error => {
                                this.errors.push(error.response.data.errors.name[0])
                                this.MessageArrayErrors(this.errors)
                            })
                        }
                        // Expenses
                        if (this.ruleForm.category === 'Расход'){
                            axios.post('/api/expenses', {
                                name: this.ruleForm.name,
                                max_limit: this.ruleForm.amount,
                                icon_id: this.ruleForm.choose
                            }).then( response => {
                                this.fetchExpenses({
                                    dateFrom: this.intervalMonth.dateFrom,
                                    dateTo: this.intervalMonth.dateTo,
                                })
                                this.successForm()
                            }).catch( error => {
                                this.errors.push(error.response.data.errors.name[0])
                                this.MessageArrayErrors(this.errors)
                            })
                        }
                    } else {
                        if (!this.ruleForm.name) this.errors.push('Введите название')
                        if (!this.ruleForm.choose) this.errors.push('Выберите картинку')
                        this.MessageArrayErrors(this.errors)
                        return false;
                    }
                });
            },
            isBalance () {
                if (this.ruleForm.category !== 'Счета')
                    this.ruleForm.balance = true
            },
            isSuccessSubmit () {
                this.ruleForm.name = this.ruleForm.choose = ''
                this.ruleForm.amount = 0
            },
            MessageArrayErrors(errors) {
                errors.forEach((error, i) => {
                    setTimeout(() => {
                        this.$message.error(error);
                    }, 100 * ++i)
                });
                this.errors = []
            },
            cancelForm () {
                this.isSuccessSubmit()
                this.$emit('cancel')
            },
            successForm () {
                this.dialogVisible = false
                this.$message.success(this.ruleForm.name + ' успешно добавлен')
                this.isSuccessSubmit()
                this.$emit('cancel')
            }
        },
    };
</script>

<style lang="scss" scoped>
    .cstm-modal-container {
        padding: 10px 10px;
    }

    .cstm-header {
        display: block;
        font-size: 25px;
        color: #ffffff;
        margin-bottom: 10px;
        text-align: center;
    }

    .cstm-point {
        margin-bottom: 10px;
        flex-basis: 15%;
        position: relative;
        margin-right: 0.72%;
        margin-left: 0.72%;
    }

    .cstm-head-point {
        color: #ffffff;
        text-align: center;
        padding-bottom: 4px;
        font-weight: 300;
    }

    .cstm-icon-point {
        font-size: 50px;
        position: relative;
        left: 50%;
        transform: translate(-50%, 0);
        cursor: grab;
    }

    .cstm-icon-point-add {
        background-color: #3d3e48;
        color: #ffffff;
    }

    .cstm-radio-gap {
        margin: 2px;
        border-radius: 50%;
    }

    .cstm-radio-gap:first-child {
        border-left: none;
    }

    .cstm-switch-margin {
        margin-left: 15px;
    }

    .cstm-switch-text {
        margin-left: 15px;
        color: #ffffff;
    }

    .cstm-amount {
        display: block;
        margin-bottom: 10px;
        color: #ffffff;
    }

    .cstm-icon-size {
        font-size: 30px;
    }

    .cstm-radio-gap {
        .el-radio-button__inner {
            border-radius: 50%;
            border: none;
            height: 72px;
        }
    }
    .cstm-radio-gap .el-radio-button__inner:first-child
    {
            border-radius: 50%;
            border: none;
            height: 72px;
        }

    .el-radio-button:first-child {
        border-radius: 50%;
        .el-radio-button__inner {
            border-radius: 50%;
        }
    }
    .el-radio-button:last-child {
        border-radius: 50%;
        .el-radio-button__inner {
            border-radius: 50%;
        }
    }
    .el-radio-button__inner [class*=el-icon-] {
        line-height: 1.6;
    }
    .el-select-dropdown__item:hover {
        background-color: #3d3e48;
    }
    .el-button {
        border-radius: 0%;
    }

</style>

<style lang="scss">
    .el-radio-button__inner,
    .el-radio-button:first-child .el-radio-button__inner,
    .el-radio-button:last-child .el-radio-button__inner {
        border-radius: 50%;
        border: none;
        height: 72px;
    }

</style>
