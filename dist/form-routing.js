(()=>{
 const selector=document.getElementById('mod');if(!selector||!window.MEGThankYou)return;
 function prepare(){const path=window.MEGThankYou.resolve(selector.value);let hidden=selector.form?.querySelector('[name="thank_you_path"]');if(!hidden&&selector.form){hidden=document.createElement('input');hidden.type='hidden';hidden.name='thank_you_path';selector.form.appendChild(hidden)}if(hidden)hidden.value=path||'';selector.dataset.thankYouPath=path||'';}
 selector.addEventListener('change',prepare);prepare();
 // Integration seam only. No simulated calendar event calls this function.
 // Enable only after the server has confirmed the real GHL appointment.
 window.MEGRedirectAfterBooking=function(booking){if(window.MEG_BOOKING_ENABLED!==true)return false;const path=window.MEGThankYou.confirmedDestination(booking,selector.value);if(!path)return false;window.location.assign(path);return true;};
})();
