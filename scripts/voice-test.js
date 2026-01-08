// Voice Command Test Script for CareCloud MBO System
// Run this in browser console to test voice functionality

console.log('🎤 VOICE COMMAND DIAGNOSTIC TEST');
console.log('================================');

// Test 1: Check Web Speech API availability
console.log('\n1. 📋 Web Speech API Availability:');
const speechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
console.log('   Speech Recognition Supported:', speechSupported ? '✅ YES' : '❌ NO');

if (speechSupported) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  console.log('   Constructor Available:', !!SpeechRecognition ? '✅ YES' : '❌ NO');
  console.log('   Constructor Name:', SpeechRecognition ? SpeechRecognition.name : 'Not available');
}

// Test 2: Check secure context
console.log('\n2. 🔒 Security Context:');
console.log('   Secure Context (HTTPS):', window.isSecureContext ? '✅ YES' : '❌ NO');
console.log('   Protocol:', window.location.protocol);

// Test 3: Check microphone permissions
console.log('\n3. 🎙️ Microphone Permissions:');
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('   Microphone Access:', '✅ GRANTED');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.log('   Microphone Access:', '❌ DENIED or ERROR');
    console.log('   Error:', error.name, error.message);
  });

// Test 4: Test basic speech recognition functionality
console.log('\n4. 🧪 Basic Speech Recognition Test:');
if (speechSupported && window.isSecureContext) {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    console.log('   Recognition Instance Created:', '✅ SUCCESS');
    
    recognition.onstart = () => {
      console.log('   🎤 Recognition Started:', '✅ SUCCESS');
    };
    
    recognition.onresult = (event) => {
      console.log('   🎤 Speech Results Received:', '✅ SUCCESS');
      console.log('   Results Count:', event.results.length);
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(`   Result ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
      }
    };
    
    recognition.onerror = (event) => {
      console.log('   🎤 Recognition Error:', '❌', event.error);
    };
    
    recognition.onend = () => {
      console.log('   🎤 Recognition Ended:', '✅ SUCCESS');
    };
    
    // Test starting recognition
    console.log('   ▶️ Attempting to start recognition...');
    recognition.start();
    
    // Auto-stop after 5 seconds for testing
    setTimeout(() => {
      try {
        recognition.stop();
        console.log('   ⏹️ Recognition stopped after 5 seconds');
      } catch (e) {
        console.log('   ⏹️ Recognition already stopped');
      }
    }, 5000);
    
  } catch (error) {
    console.log('   Recognition Test Failed:', '❌', error.message);
  }
} else {
  console.log('   Recognition Test Skipped:', '⚠️ Requirements not met');
}

// Test 5: Check DOM elements
console.log('\n5. 🖥️ DOM Elements Check:');
setTimeout(() => {
  const micButton = document.querySelector('button[title*="voice"]');
  console.log('   Microphone Button Found:', micButton ? '✅ YES' : '❌ NO');
  
  const textarea = document.querySelector('textarea');
  console.log('   Textarea Found:', textarea ? '✅ YES' : '❌ NO');
  
  if (micButton) {
    console.log('   Button Classes:', micButton.className);
  }
}, 1000);

console.log('\n🔍 Test Complete! Check results above.');
console.log('💡 To manually test:');
console.log('   1. Navigate to Employee Objectives page');
console.log('   2. Click the microphone icon');
console.log('   3. Speak clearly into your microphone');
console.log('   4. Check if text appears in the textarea');
