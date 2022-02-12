export const UniformInput = {
    template:
    `
    <label class="input-group-label">{{ label }}: </label>
    <div v-if="fields != 1" class="input-group">
        <input class="input-group-input" v-for="(field, index) in fields" type="number" v-model="uniform.value[index]" :step="uniform.increment || inputType" :min="uniform.min" :max="uniform.max">
    </div>
    <div v-else class="input-group">
        <input class="input-group-input" type="number" v-model="uniform.value" :step="uniform.increment" :min="uniform.min" :max="uniform.max">
    </div>
    `,
    data() {
        return {

        }
    },
    props: {
        modelValue: Object,
        label: String,
    },
    emits: [
        'update:modelValue',
    ],
    computed: {
        uniform: {
          get() {
            return this.modelValue
          },
          set(value) {
            this.$emit('update:modelValue', value)
          }
        },
        fields() {
            let amount = 1;

            switch(this.modelValue.type.substring(0, 1)) {
                case '4':
                    amount = 4;
                    break;
                case '3':
                    amount = 3;
                    break;
                case '2':
                    amount = 2;
                    break;
                case '1':
                    amount = 1;
                    break;
            }

            return amount;
        },
        inputType() {
            if (this.modelValue.type.endsWith('i')) {
                return 1;
            }
            else return undefined;
        },
    },
} 