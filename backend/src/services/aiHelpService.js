// Static AI Help Service
const helpOptions = [
  {
    type: 'order_issue',
    title: 'Problem with my order',
    responses: [
      'You can track your order from the Order History page.',
      'If your order is delayed, please contact support or use the Help Desk.',
      'For wrong or missing items, you can request a refund or replacement.'
    ]
  },
  {
    type: 'payment_issue',
    title: 'Payment or refund issue',
    responses: [
      'Check your payment status in the Payment Gateway page.',
      'Refunds are processed within 3-5 business days.',
      'Contact support for unresolved payment issues.'
    ]
  },
  {
    type: 'general',
    title: 'General help',
    responses: [
      'Browse FAQs or contact support for more help.',
      'You can update your profile and address in the Profile page.'
    ]
  }
];

exports.getHelpOptions = () => helpOptions;
exports.getResponseByType = (type) => {
  const option = helpOptions.find(opt => opt.type === type);
  return option ? option.responses : helpOptions.find(opt => opt.type === 'general').responses;
};
