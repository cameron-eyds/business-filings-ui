import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuelidate from 'vuelidate'
import { getVuexStore } from '@/store'
import { shallowMount } from '@vue/test-utils'
import { DetailsList } from '@/components/common'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore() as any // remove typings for unit tests

describe('Details List', () => {
  const mockFilingNoComments = {
    type: 'annualReport',
    title: 'Annual Report (2018)',
    filingId: 63958,
    submitter: 'John Doe',
    submittedDate: '2018-12-12',
    paymentToken: null,
    isPaperOnly: true,
    comments: []
  }

  const mockFilingOneComment = {
    type: 'annualReport',
    title: 'Annual Report (2018)',
    filingId: 63958,
    submitter: 'John Doe',
    submittedDate: '2018-12-12',
    paymentToken: null,
    isPaperOnly: true,
    comments: [
      {
        comment: {
          comment: 'Correction for Annual Report (2018), filed on 2018-01-08.',
          filingId: 63958,
          id: 123,
          submitterDisplayName: 'cbIdIr1234',
          timestamp: '2020-03-02T20:26:31.697044+00:00'
        }
      }
    ]
  }

  const mockFilingManyComments = {
    type: 'annualReport',
    title: 'Annual Report (2018)',
    filingId: 63958,
    submitter: 'John Doe',
    submittedDate: '2018-12-12',
    paymentToken: null,
    isPaperOnly: true,
    comments: [
      {
        comment: {
          comment: 'Correction for Annual Report (2018), filed on 2018-01-08.',
          filingId: 63958,
          id: 111,
          submitterDisplayName: 'cbIdIr1234',
          timestamp: '2020-03-02T20:26:31.697044+00:00'
        }
      },
      {
        comment: {
          comment: 'Correction for director mailing delivery address, filed on 2018-01-08.',
          filingId: 63958,
          id: 222,
          submitterDisplayName: 'sevIdiR2020',
          timestamp: '2020-03-05T20:26:31.697044+00:00'
        }
      },
      {
        comment: {
          comment: 'Correction for office delivery address Change, filed on 2018-01-08.',
          filingId: 63958,
          id: 333,
          submitterDisplayName: 'cbIdIr1234',
          timestamp: '2020-03-06T20:26:33.697044+00:00'
        }
      }
    ]
  }

  it('Displays no details if filing contains no comments', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockFilingNoComments } })

    expect(wrapper.find('.detail-body').exists()).toBe(false)

    wrapper.destroy()
  })

  it('Displays details if filing contains comments', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockFilingOneComment } })

    expect(wrapper.find('.detail-body').exists()).toBe(true)

    wrapper.destroy()
  })

  it('Displays the correct count in the title - single detail', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockFilingOneComment } })

    expect(wrapper.find('.title-bar').text()).toContain('Detail (1)')

    wrapper.destroy()
  })

  it('Displays the correct count in the title - multiple details', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockFilingManyComments } })

    expect(wrapper.find('.title-bar').text()).toContain('Details (3)')

    wrapper.destroy()
  })

  it('Displays the correct number of details in the list', () => {
    const wrapper = shallowMount(DetailsList, { store, propsData: { filing: mockFilingManyComments } })

    expect(wrapper.findAll('.detail-body').length).toEqual(3)

    wrapper.destroy()
  })

  it('Does NOT display the add detail btn when the user is NOT staff', () => {
    store.state.keycloakRoles = ['user']

    const wrapper = shallowMount(DetailsList, {
      store,
      propsData: {
        filing: mockFilingOneComment,
        isTask: false
      }
    })

    expect(wrapper.find('.title-bar').text()).not.toContain('Add Detail')

    wrapper.destroy()
  })

  it('Does NOT display the add detail btn when the item is a task', () => {
    store.state.keycloakRoles = ['staff']

    const wrapper = shallowMount(DetailsList, {
      store,
      propsData: {
        filing: mockFilingOneComment,
        isTask: true
      }
    })

    expect(wrapper.find('.title-bar').text()).not.toContain('Add Detail')

    wrapper.destroy()
  })

  it('Displays the Add Detail button if staff user and NOT a task item', () => {
    store.state.keycloakRoles = ['staff']

    const wrapper = shallowMount(DetailsList, {
      store,
      propsData: {
        filing: mockFilingOneComment,
        isTask: false
      }
    })

    expect(wrapper.find('.title-bar').text()).toContain('Add Detail')

    wrapper.destroy()
  })

  it('Displays the correct filing data if NOT staff user', () => {
    store.state.keycloakRoles = ['user']

    const wrapper = shallowMount(DetailsList, {
      store,
      propsData: {
        filing: mockFilingOneComment,
        isTask: false
      }
    })

    expect(wrapper.find('.title-bar').text()).toContain('Detail (1)')
    expect(wrapper.find('.title-bar').text()).not.toContain('Add Detail')
    expect(wrapper.find('.body-2').text()).toContain('BC Registries Staff')
    expect(wrapper.find('.body-2 .pre-line').text())
      .toContain('Correction for Annual Report (2018), filed on 2018-01-08.')

    wrapper.destroy()
  })

  it('Displays the correct filing data if staff user', async () => {
    store.state.keycloakRoles = ['staff']

    const wrapper = shallowMount(DetailsList, {
      store,
      vuetify,
      propsData: {
        filing: mockFilingManyComments,
        isTask: false
      }
    })
    await Vue.nextTick()

    expect(wrapper.find('.title-bar').text()).toContain('Details (3)')
    expect(wrapper.find('.title-bar').text()).toContain('Add Detail')

    const firstItem = wrapper.findAll('.body-2').at(1)
    const thirdItem = wrapper.findAll('.body-2').at(3)

    expect(firstItem.text()).toContain('cbIdIr1234')
    expect(firstItem.text()).toContain('2020-03-02T20:26:31.697044+00:00')
    expect(firstItem.find('.pre-line').text())
      .toContain('Correction for Annual Report (2018), filed on 2018-01-08.')

    expect(thirdItem.text()).toContain('sevIdiR2020')
    expect(thirdItem.text()).toContain('2020-03-05T20:26:31.697044+00:00')
    expect(thirdItem.find('.pre-line').text())
      .toContain('Correction for director mailing delivery address, filed on 2018-01-08.')

    wrapper.destroy()
  })
})
