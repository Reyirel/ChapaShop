import { track } from '@vercel/analytics'

export const useAnalytics = () => {
  const trackEvent = (eventName, properties = {}) => {
    try {
      track(eventName, properties)
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  // Eventos específicos para ChapaShop
  const trackBusinessView = (businessId, businessName, category) => {
    trackEvent('business_view', {
      business_id: businessId,
      business_name: businessName,
      category: category
    })
  }

  const trackBusinessContact = (businessId, contactType) => {
    trackEvent('business_contact', {
      business_id: businessId,
      contact_type: contactType // 'phone', 'whatsapp', 'email', 'website'
    })
  }

  const trackFavoriteAction = (businessId, action) => {
    trackEvent('favorite_action', {
      business_id: businessId,
      action: action // 'add', 'remove'
    })
  }

  const trackReviewSubmit = (businessId, rating) => {
    trackEvent('review_submit', {
      business_id: businessId,
      rating: rating
    })
  }

  const trackCategoryFilter = (category) => {
    trackEvent('category_filter', {
      category: category
    })
  }

  const trackSearch = (query, resultsCount) => {
    trackEvent('search', {
      query: query,
      results_count: resultsCount
    })
  }

  const trackUserRegistration = (method) => {
    trackEvent('user_registration', {
      method: method // 'email', 'google', etc.
    })
  }

  const trackUserLogin = (method) => {
    trackEvent('user_login', {
      method: method
    })
  }

  const trackBusinessRegistration = (businessId, category) => {
    trackEvent('business_registration', {
      business_id: businessId,
      category: category
    })
  }

  const trackPageView = (pageName, additionalData = {}) => {
    trackEvent('page_view', {
      page: pageName,
      ...additionalData
    })
  }

  return {
    trackEvent,
    trackBusinessView,
    trackBusinessContact,
    trackFavoriteAction,
    trackReviewSubmit,
    trackCategoryFilter,
    trackSearch,
    trackUserRegistration,
    trackUserLogin,
    trackBusinessRegistration,
    trackPageView
  }
}

export default useAnalytics
