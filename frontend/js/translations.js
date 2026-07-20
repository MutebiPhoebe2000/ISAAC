/**
 * AYICRIP Summit — Translation Engine
 * Dynamic multilingual interface translation without page reload.
 * Supports English, Swahili, French, Arabic, Portuguese, Amharic,
 * Kinyarwanda, Kirundi, Zulu, Xhosa, and Afrikaans.
 *
 * Usage:
 *   - Add data-i18n="key" to any element for text content translation
 *   - Add data-i18n-placeholder="key" for placeholder translation
 *   - Call Translate.setLanguage('sw') to switch languages
 *   - Call Translate.t('key') to get a translation string programmatically
 */
(function () {
  'use strict';

  var currentLang = 'en';

  /* ===== DICTIONARIES ===== */
  var DICT = {};

  /* ---------- English (Default) ---------- */
  DICT.en = {
    /* Global */
    lang_name: 'English',
    site_title: 'AYICRIP African Youth Summit',
    site_subtitle: 'on Drug and Crime 2026',

    /* Navbar */
    nav_about: 'About',
    nav_objectives: 'Objectives',
    nav_themes: 'Topics',
    nav_timeline: 'How It Works',
    nav_speakers: 'Speakers',
    nav_committee: 'Committee',
    nav_mombasa: 'Mombasa',
    nav_faq: 'FAQ',
    nav_payment: 'Payment',
    nav_register: 'Register',
    nav_login: 'Sign In',

    /* Hero */
    hero_badge: 'AYICRIP Flagship Event',
    hero_title: 'AYICRIP African Youth Summit on Drug and Crime 2026',
    hero_location: 'Mombasa, Kenya',
    hero_dates: '15–17 September 2026',
    hero_description: 'Bringing together youth leaders, policymakers, and civil society from across Africa to build safer communities.',
    hero_register_btn: 'Register as a Delegate',
    hero_learn_btn: 'Learn More',
    hero_countdown_title: 'Summit Countdown',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',

    /* Stats */
    stat_nations: 'African Nations',
    stat_delegates: 'Expected Delegates',
    stat_days: 'Summit Days',
    stat_speakers: 'Expert Speakers',

    /* About */
    about_label: 'Our Mission',
    about_title: 'Empowering Youth to Prevent Crime and Substance Abuse',
    about_p1: 'The African Youth Initiative on Crime Prevention (AYICRIP) recognizes that real solutions require continental cooperation. This first-of-its-kind summit creates a platform where young leaders connect with policymakers, enforcement, and communities.',
    about_p2: 'Our focus: prevention strategies, grassroots health programs, cross-border collaboration, and digital solutions tailored to African communities.',
    about_btn: 'Register Now',

    /* Objectives */
    obj_label: 'Summit Goals',
    obj_title: 'What We Aim to Achieve',
    obj_1_title: 'Raise Awareness',
    obj_1_desc: 'Understand the root causes of drug distribution and youth vulnerability through evidence-based approaches.',
    obj_2_title: 'Empower Youth',
    obj_2_desc: 'Equip young leaders with governance skills, grant management, and peer advocacy training.',
    obj_3_title: 'Shape Policy',
    obj_3_desc: 'Draft a unified Youth Action Manifesto on drug and crime prevention for national legislation.',
    obj_4_title: 'Build Partnerships',
    obj_4_desc: 'Connect advocacy groups, law enforcement, and local communities for lasting impact.',
    obj_5_title: 'Use Technology',
    obj_5_desc: 'Deploy digital reporting tools, spatial mapping, and mental health apps for prevention.',
    obj_6_title: 'Community Action',
    obj_6_desc: 'Launch sustainable community safety programs owned and managed by local youth groups.',

    /* Themes */
    themes_label: 'Summit Topics',
    themes_title: 'Key Discussion Areas',
    theme_1: 'Crime Prevention',
    theme_2: 'Drug & Substance Interventions',
    theme_3: 'Mental Health Integration',
    theme_4: 'Youth Leadership',
    theme_5: 'Community Policing',
    theme_6: 'Rehabilitation Programs',
    theme_7: 'Peace Building',
    theme_8: 'Digital & Cyber Safety',
    theme_9: 'Policy Development',

    /* Timeline */
    timeline_label: 'How It Works',
    timeline_title: 'Your Journey to the Summit',
    step_1: 'Apply',
    step_1_desc: 'Complete your profile',
    step_2: 'Review',
    step_2_desc: 'We review your application',
    step_3: 'Approval',
    step_3_desc: 'Get your confirmation',
    step_4: 'Payment',
    step_4_desc: 'Secure your spot',
    step_5: 'Hotel',
    step_5_desc: 'Choose accommodation',
    step_6: 'Attend',
    step_6_desc: 'Join us in Mombasa',

    /* Mombasa */
    mombasa_label: 'Host City',
    mombasa_title: 'Mombasa: A City of Culture and Dialogue',
    mombasa_desc: 'Mombasa is a historic coastal city that provides the perfect setting for this summit. Known for its rich cultural heritage and strong community networks, it offers real-world context for our discussions.',
    mombasa_venue: 'Venue:',
    mombasa_venue_name: 'Mombasa International Convention Centre & Coastal Resorts',
    highlight_1_title: 'Government Roundtables',
    highlight_1_desc: 'Youth leaders present directly to regional ministers in interactive sessions.',
    highlight_2_title: 'Prevention Hackathon',
    highlight_2_desc: 'Build digital tools and solutions for crime and substance abuse prevention.',
    highlight_3_title: 'Community Assembly',
    highlight_3_desc: 'Simulations of emergency interventions in vulnerable communities.',

    /* Speakers */
    speakers_label: 'Speakers',
    speakers_title: 'Keynote Speakers',

    /* Organizing Committee */
    committee_label: 'Our Team',
    committee_title: 'Organizing Committee',
    committee_desc: 'The dedicated team behind the planning and delivery of the summit.',

    /* Hotels */
    hotels_label: 'Accommodation',
    hotels_title: 'Sapphire Hotel Mombasa',

    /* Partners */
    partners_label: 'Partners & Supporters',

    /* FAQ */
    faq_label: 'FAQ',
    faq_title: 'Frequently Asked Questions',
    faq_1_q: 'Who can register for the summit?',
    faq_1_a: 'Youth leaders, community workers, students, and government delegates aged 18–35 who are involved in community safety are eligible to apply.',
    faq_2_q: 'Will I get a visa support letter?',
    faq_2_a: 'Yes. Approved international delegates receive a Visa Support Letter and formal Invitation Package through their delegate dashboard.',
    faq_3_q: 'How is payment verified?',
    faq_3_a: 'After uploading your payment proof in Stage 2, our finance team verifies your transaction within 48 hours.',

    /* Contact */
    contact_title: 'Get in Touch',
    contact_desc: 'Questions about registration, sponsorship, or speaking opportunities? Contact our team.',
    contact_name: 'Full Name',
    contact_email: 'Email Address',
    contact_subject: 'Subject',
    contact_message: 'Your Message',
    contact_send: 'Send Message',
    contact_success: 'Your message has been sent. We\'ll get back to you soon!',

    /* Footer */
    footer_desc: 'Empowering African youth to build safer communities through prevention, education, and collaboration.',
    footer_links: 'Quick Links',
    footer_social: 'Follow Us',
    footer_copy: '© 2026 AYICRIP International Secretariat. All rights reserved.',

    /* Auth / Registration */
    auth_login_tab: 'Sign In',
    auth_register_tab: 'Register',
    auth_login_title: 'Welcome Back',
    auth_login_desc: 'Sign in to access your delegate dashboard.',
    auth_login_email: 'Email Address',
    auth_login_password: 'Password',
    auth_login_remember: 'Remember me',
    auth_login_forgot: 'Forgot password?',
    auth_login_btn: 'Sign In',
    auth_sandbox: 'Demo Credentials:',

    /* Registration welcome */
    reg_welcome_title: 'Welcome to the Summit Registration',
    reg_welcome_desc: 'The registration takes about 5 minutes. Your progress is saved automatically.',
    reg_welcome_start: 'Let\'s Get Started',

    /* Country selection */
    reg_country_title: 'Select Your Country',
    reg_country_desc: 'Please choose your country of residence.',
    reg_country_search: 'Search for your country...',
    reg_country_next: 'Continue',

    /* Language selection */
    reg_lang_title: 'Choose Your Language',
    reg_lang_desc: 'This registration is available in English. Would you like to continue in English?',
    reg_lang_continue: 'Continue in English',
    reg_lang_choose: 'Choose another language',
    reg_lang_suggested: 'Suggested for your country:',

    /* Registration steps */
    reg_step: 'Step',
    reg_of: 'of',
    reg_next: 'Continue',
    reg_back: 'Back',
    reg_submit: 'Submit Application',

    /* Step 1: Who you are */
    reg_s1_title: 'Tell us who you are',
    reg_s1_desc: 'Choose the category that best describes you.',
    cat_individual: 'I\'m attending individually',
    cat_org: 'I represent an organization',
    cat_youth: 'I represent a youth group',
    cat_govt: 'I work for government',
    cat_ngo: 'I\'m from an NGO/CBO',
    cat_faith: 'I\'m from a faith organization',
    cat_student: 'I\'m a student',
    cat_media: 'I\'m from the media',
    cat_sponsor: 'I\'m a sponsor',
    cat_speaker: 'I\'m a speaker',
    cat_exhibitor: 'I\'m an exhibitor',

    /* Step 2: Your details */
    reg_s2_title: 'Your Details',
    reg_s2_desc: 'Tell us a bit about yourself.',
    field_fullname: 'Full Name',
    field_dob: 'Date of Birth',
    field_age: 'Age',
    field_nationality: 'Nationality',
    field_gender: 'Gender',
    gender_male: 'Male',
    gender_female: 'Female',
    gender_other: 'Prefer not to say',

    /* Step 3: Contact info */
    reg_s3_title: 'How can we reach you?',
    reg_s3_desc: 'We\'ll use these details to send you updates about the summit.',
    field_email: 'Email Address',
    field_phone: 'Phone Number',
    field_whatsapp: 'WhatsApp Number',
    field_alt_contact: 'Alternative Contact (optional)',
    field_address: 'Street Address',
    field_city: 'City',
    field_country: 'Country',
    field_password: 'Create a Password',
    field_password_confirm: 'Confirm Password',
    password_hint: 'At least 6 characters',

    /* Step 4: Identification */
    reg_s4_title: 'Your Identification',
    reg_s4_desc: 'Upload either your National ID or Passport.',
    id_have_national: 'Do you have a National ID?',
    id_yes: 'Yes',
    id_no: 'No, I\'ll use my passport',
    field_nin: 'National ID Number',
    field_id_upload: 'Upload National ID',
    field_passport_no: 'Passport Number',
    field_passport_expiry: 'Passport Expiry Date',
    field_passport_upload: 'Upload Passport (bio-data page)',

    /* Step 5: Organization */
    reg_s5_title: 'About Your Organization',
    reg_s5_desc: 'Tell us about the organization you represent.',
    field_org_name: 'Organization Name',
    field_org_position: 'Your Role / Position',
    field_org_website: 'Website (optional)',
    field_org_years: 'Years working with youth',
    field_org_address: 'Organization Address',

    /* Step 6: Participation */
    reg_s6_title: 'About Your Participation',
    reg_s6_desc: 'Help us understand your interests and needs.',
    field_motivation: 'Why do you want to attend?',
    field_motivation_hint: 'Tell us briefly what you hope to gain from the summit.',
    field_themes: 'Which topics interest you? (select all that apply)',
    field_past_conf: 'Have you attended international conferences before?',
    field_need_invitation: 'Do you need a formal Invitation Letter?',
    field_need_visa: 'Do you need Visa Support?',
    speaker_section: 'Speaker Details',
    field_speaker_title: 'Presentation Title',
    field_speaker_cv: 'Upload Your CV',
    field_speaker_abstract: 'Abstract Summary',
    field_speaker_bio: 'Short Bio',
    field_speaker_photo: 'Professional Photo',
    sponsor_section: 'Sponsorship Details',
    field_sponsor_tier: 'Sponsorship Level',
    field_sponsor_proposal: 'Upload Proposal',
    field_sponsor_interest: 'Why do you want to sponsor?',
    media_section: 'Media Credentials',
    field_media_house: 'Media Organization',
    field_media_role: 'Your Role',
    field_media_creds: 'Upload Press Credentials',

    /* Step 7: Review & Confirm */
    reg_s7_title: 'Review & Confirm',
    reg_s7_desc: 'Please read carefully and confirm your application.',
    declaration_title: 'Code of Conduct',
    declaration_text: 'All delegates commit to maintaining neutrality, transparency, and collaboration throughout the summit. Unauthorized sharing of confidential materials or disruptive behavior will result in removal from the event.',
    check_accuracy: 'I confirm that all information provided is accurate and truthful.',
    check_conduct: 'I accept the AYICRIP Code of Conduct.',
    signature_label: 'Your Signature',
    signature_clear: 'Clear',

    /* Success */
    reg_success_title: 'Application Submitted!',
    reg_success_msg: 'We\'ve received your application and will review it shortly. You\'ll receive an email once approved.',
    reg_success_btn: 'Go to Sign In',

    /* Validation messages */
    val_required: 'This field is required.',
    val_email: 'Please enter a valid email address.',
    val_password_length: 'Password must be at least 6 characters.',
    val_password_match: 'Passwords do not match.',
    val_select_category: 'Please select a category.',
    val_select_gender: 'Please select a gender.',
    val_select_theme: 'Please select at least one topic.',
    val_motivation: 'Please share your motivation.',
    val_declaration: 'You must accept this declaration.',
    val_signature: 'Please provide your signature.',
    val_country: 'Please select a country.',

    /* Language switcher */
    lang_switch_title: 'Language',
    lang_switch_fallback: 'Quick switch:',

    /* Dashboard - common */
    dash_logout: 'Sign Out',
    dash_loading: 'Loading...',

    /* Admin labels */
    admin_title: 'Admin Dashboard',
    admin_overview: 'Overview',
    admin_applications: 'All Applications',
    admin_approved: 'Approved',
    admin_rejected: 'Rejected',
    admin_kenyan: 'Kenyan Delegates',
    admin_international: 'International Delegates',
    admin_payments: 'Payments',
    admin_accommodation: 'Accommodation',
    admin_transfers: 'Airport Transfers',
    admin_letters: 'Invitation Letters',
    admin_visas: 'Visa Support',
    admin_speakers_panel: 'Speakers',
    admin_sponsors: 'Sponsors',
    admin_reports: 'Reports',
    admin_search: 'Search delegates...',
    admin_approve_btn: 'Approve',
    admin_reject_btn: 'Reject',
    admin_delete_btn: 'Delete',
    admin_review_btn: 'Review',
    admin_total: 'Total Applications',
    admin_approved_count: 'Approved',
    admin_pending_count: 'Pending Review',
    admin_countries_count: 'Countries Represented',
    admin_export_csv: 'Export CSV',
    admin_export_pdf: 'Export PDF',

    /* Participant labels */
    participant_home: 'Dashboard',
    participant_stage2: 'Stage 2: Payment & Hotel',
    participant_status: 'Application Status',
    participant_badge: 'Summit ID Badge',
    participant_profile: 'My Profile',
    participant_docs: 'Documents',
    participant_certs: 'Certificates',
    participant_app_status: 'Application Status',
    participant_payment: 'Payment Status',
    participant_hotel: 'Hotel Assignment',
    participant_complete_stage2: 'Complete Stage 2',

    /* Generic */
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    download: 'Download',
    upload: 'Upload',
    loading: 'Loading...',
    page: 'Page',
    of_pages: 'of',
    previous: 'Previous',
    next_page: 'Next',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  /* ---------- Swahili ---------- */
  DICT.sw = {
    lang_name: 'Kiswahili',
    site_title: 'Mkutano wa 1 wa Vijana wa Afrika',
    site_subtitle: 'kuhusu Kuzuia Uhalifu, Dawa za Kulevya na Matumizi Mabaya',
    nav_about: 'Kuhusu',
    nav_objectives: 'Malengo',
    nav_themes: 'Mada',
    nav_timeline: 'Jinsi Inavyofanya Kazi',
    nav_speakers: 'Wasemaji',
    nav_mombasa: 'Mombasa',
    nav_faq: 'Maswali',
    nav_register: 'Jisajili',
    nav_login: 'Ingia',
    hero_badge: 'Tukio Kuu la AYICRIP',
    hero_title: 'Mkutano wa 1 wa Vijana wa Afrika kuhusu Kuzuia Uhalifu, Dawa za Kulevya na Matumizi Mabaya',
    hero_location: 'Mombasa, Kenya',
    hero_dates: '15–17 Septemba 2026',
    hero_description: 'Kuwaleta pamoja viongozi vijana, watunga sera na asasi za kiraia kutoka Afrika nzima kujenga jamii salama.',
    hero_register_btn: 'Jisajili kama Mjumbe',
    hero_learn_btn: 'Jifunze Zaidi',
    hero_countdown_title: 'Siku za Mkutano',
    days: 'Siku',
    hours: 'Saa',
    minutes: 'Dakika',
    seconds: 'Sekunde',
    stat_nations: 'Mataifa ya Afrika',
    stat_delegates: 'Wajumbe Watarajiwa',
    stat_days: 'Siku za Mkutano',
    stat_speakers: 'Wasemaji Wataalam',
    about_label: 'Dhamira Yetu',
    about_title: 'Kuwawezesha Vijana Kuzuia Uhalifu na Matumizi ya Dawa',
    about_btn: 'Jisajili Sasa',
    obj_label: 'Malengo ya Mkutano',
    obj_title: 'Tunachotaka Kufanikisha',
    themes_label: 'Mada za Mkutano',
    themes_title: 'Maeneo Muhimu ya Majadiliano',
    timeline_label: 'Jinsi Inavyofanya Kazi',
    timeline_title: 'Safari Yako hadi Mkutano',
    step_1: 'Omba',
    step_1_desc: 'Kamilisha wasifu wako',
    step_2: 'Ukaguzi',
    step_2_desc: 'Tunakagua maombi yako',
    step_3: 'Kibali',
    step_3_desc: 'Pata uthibitisho wako',
    step_4: 'Malipo',
    step_4_desc: 'Hakikisha nafasi yako',
    step_5: 'Hoteli',
    step_5_desc: 'Chagua malazi',
    step_6: 'Hudhuria',
    step_6_desc: 'Jiunge nasi Mombasa',
    faq_label: 'Maswali',
    faq_title: 'Maswali Yanayoulizwa Mara Kwa Mara',
    faq_1_q: 'Nani anaweza kujisajili kwa mkutano?',
    faq_1_a: 'Viongozi vijana, wafanyakazi wa jamii, wanafunzi, na wajumbe wa serikali wenye umri wa miaka 18-35 wanaohusika katika usalama wa jamii wanaweza kuomba.',
    faq_2_q: 'Nitapata barua ya msaada wa visa?',
    faq_2_a: 'Ndiyo. Wajumbe wa kimataifa walioidhinishwa wanapokea Barua ya Msaada wa Visa na Kifurushi cha Mwaliko kupitia dashibodi yao.',
    faq_3_q: 'Malipo yanathibitishwaje?',
    faq_3_a: 'Baada ya kupakia uthibitisho wa malipo katika Hatua ya 2, timu yetu ya fedha inathibitisha muamala wako ndani ya saa 48.',
    contact_title: 'Wasiliana Nasi',
    contact_desc: 'Maswali kuhusu usajili, ufadhili, au fursa za kuzungumza? Wasiliana na timu yetu.',
    contact_name: 'Jina Kamili',
    contact_email: 'Barua Pepe',
    contact_subject: 'Somo',
    contact_message: 'Ujumbe Wako',
    contact_send: 'Tuma Ujumbe',
    contact_success: 'Ujumbe wako umetumwa. Tutawasiliana nawe hivi karibuni!',
    auth_login_tab: 'Ingia',
    auth_register_tab: 'Jisajili',
    auth_login_title: 'Karibu Tena',
    auth_login_desc: 'Ingia kufikia dashibodi yako ya mjumbe.',
    auth_login_email: 'Barua Pepe',
    auth_login_password: 'Neno Siri',
    auth_login_remember: 'Nikumbuke',
    auth_login_forgot: 'Umesahau neno siri?',
    auth_login_btn: 'Ingia',
    reg_welcome_title: 'Karibu kwenye Usajili wa Mkutano',
    reg_welcome_desc: 'Usajili unachukua takriban dakika 5. Maendeleo yako yanahifadhiwa kiotomatiki.',
    reg_welcome_start: 'Tuanze',
    reg_country_title: 'Chagua Nchi Yako',
    reg_country_desc: 'Tafadhali chagua nchi yako ya makazi.',
    reg_country_search: 'Tafuta nchi yako...',
    reg_country_next: 'Endelea',
    reg_lang_title: 'Chagua Lugha Yako',
    reg_lang_desc: 'Usajili huu unapatikana kwa Kiingereza. Ungependa kuendelea kwa Kiingereza?',
    reg_lang_continue: 'Endelea kwa Kiingereza',
    reg_lang_choose: 'Chagua lugha nyingine',
    reg_step: 'Hatua',
    reg_of: 'ya',
    reg_next: 'Endelea',
    reg_back: 'Rudi',
    reg_submit: 'Wasilisha Maombi',
    reg_s1_title: 'Tuambie wewe ni nani',
    reg_s1_desc: 'Chagua kundi linaloelezea hali yako.',
    cat_individual: 'Ninahudhuria kibinafsi',
    cat_org: 'Ninawakilisha shirika',
    cat_youth: 'Ninawakilisha kikundi cha vijana',
    cat_govt: 'Ninafanya kazi serikalini',
    cat_ngo: 'Ninatoka NGO/CBO',
    cat_faith: 'Ninatoka shirika la imani',
    cat_student: 'Mimi ni mwanafunzi',
    cat_media: 'Ninatoka vyombo vya habari',
    cat_sponsor: 'Mimi ni mfadhili',
    cat_speaker: 'Mimi ni msemaji',
    cat_exhibitor: 'Mimi ni mtoa maonyesho',
    reg_s2_title: 'Taarifa Zako',
    reg_s2_desc: 'Tuambie kidogo kuhusu wewe.',
    field_fullname: 'Jina Kamili',
    field_dob: 'Tarehe ya Kuzaliwa',
    field_age: 'Umri',
    field_nationality: 'Utaifa',
    field_gender: 'Jinsia',
    gender_male: 'Mwanaume',
    gender_female: 'Mwanamke',
    gender_other: 'Napendelea kutosema',
    reg_s3_title: 'Tunawezaje kukufikia?',
    reg_s3_desc: 'Tutatumia maelezo haya kukutumia taarifa za mkutano.',
    field_email: 'Barua Pepe',
    field_phone: 'Nambari ya Simu',
    field_whatsapp: 'Nambari ya WhatsApp',
    field_address: 'Anwani ya Mtaa',
    field_city: 'Jiji',
    field_country: 'Nchi',
    field_password: 'Unda Neno Siri',
    field_password_confirm: 'Thibitisha Neno Siri',
    reg_s4_title: 'Kitambulisho Chako',
    reg_s4_desc: 'Pakia Kitambulisho chako cha Kitaifa au Pasipoti.',
    id_have_national: 'Una Kitambulisho cha Kitaifa?',
    id_yes: 'Ndiyo',
    id_no: 'Hapana, nitatumia pasipoti yangu',
    field_nin: 'Nambari ya Kitambulisho',
    field_id_upload: 'Pakia Kitambulisho',
    field_passport_no: 'Nambari ya Pasipoti',
    field_passport_expiry: 'Tarehe ya Mwisho ya Pasipoti',
    field_passport_upload: 'Pakia Pasipoti',
    reg_s5_title: 'Kuhusu Shirika Lako',
    reg_s5_desc: 'Tuambie kuhusu shirika unalowakilisha.',
    field_org_name: 'Jina la Shirika',
    field_org_position: 'Nafasi / Cheo Chako',
    field_org_website: 'Tovuti (si lazima)',
    field_org_years: 'Miaka ya kufanya kazi na vijana',
    field_org_address: 'Anwani ya Shirika',
    reg_s6_title: 'Kuhusu Ushiriki Wako',
    reg_s6_desc: 'Tusaidie kuelewa mapendeleo na mahitaji yako.',
    field_motivation: 'Kwa nini unataka kuhudhuria?',
    field_themes: 'Mada zipi zinakuvutia?',
    field_past_conf: 'Umehudhuria mkutano wa kimataifa hapo awali?',
    field_need_invitation: 'Unahitaji Barua ya Mwaliko?',
    field_need_visa: 'Unahitaji Msaada wa Visa?',
    reg_s7_title: 'Kagua na Uthibitishe',
    reg_s7_desc: 'Tafadhali soma kwa makini na uthibitishe maombi yako.',
    check_accuracy: 'Ninathibitisha kuwa taarifa zote zilizotolewa ni sahihi na za kweli.',
    check_conduct: 'Nakubali Kanuni za Maadili za AYICRIP.',
    signature_label: 'Sahihi Yako',
    signature_clear: 'Futa',
    reg_success_title: 'Maombi Yamewasilishwa!',
    reg_success_msg: 'Tumepokea maombi yako na tutayakagua hivi karibuni. Utapata barua pepe ukisha idhinishwa.',
    reg_success_btn: 'Nenda kwenye Kuingia',
    val_required: 'Sehemu hii inahitajika.',
    val_email: 'Tafadhali weka barua pepe halali.',
    val_password_length: 'Neno siri lazima liwe na herufi 6 au zaidi.',
    val_password_match: 'Maneno siri hayalingani.',
    val_select_category: 'Tafadhali chagua kundi.',
    val_select_gender: 'Tafadhali chagua jinsia.',
    val_select_theme: 'Tafadhali chagua mada moja au zaidi.',
    val_motivation: 'Tafadhali shiriki motisha yako.',
    val_declaration: 'Lazima ukubali tamko hili.',
    val_signature: 'Tafadhali toa sahihi yako.',
    lang_switch_title: 'Lugha',
    lang_switch_fallback: 'Badilisha haraka:',
    dash_logout: 'Ondoka',
    yes: 'Ndiyo',
    no: 'Hapana',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    close: 'Funga',
    download: 'Pakua',
    upload: 'Pakia',
    loading: 'Inapakia...',
    previous: 'Iliyopita',
    next_page: 'Ifuatayo',
    pending: 'Inasubiri',
    approved: 'Imeidhinishwa',
    rejected: 'Imekataliwa'
  };

  /* ---------- French ---------- */
  DICT.fr = {
    lang_name: 'Français',
    nav_register: 'S\'inscrire',
    nav_login: 'Connexion',
    hero_register_btn: 'S\'inscrire comme délégué',
    hero_learn_btn: 'En savoir plus',
    reg_welcome_title: 'Bienvenue à l\'inscription au Sommet',
    reg_welcome_desc: 'L\'inscription prend environ 5 minutes. Votre progression est sauvegardée automatiquement.',
    reg_welcome_start: 'Commençons',
    reg_country_title: 'Sélectionnez votre pays',
    reg_country_desc: 'Veuillez choisir votre pays de résidence.',
    reg_country_search: 'Cherchez votre pays...',
    reg_next: 'Continuer',
    reg_back: 'Retour',
    reg_submit: 'Soumettre la candidature',
    reg_s1_title: 'Dites-nous qui vous êtes',
    reg_s2_title: 'Vos informations',
    reg_s3_title: 'Comment vous contacter ?',
    reg_s4_title: 'Votre pièce d\'identité',
    reg_s5_title: 'Votre organisation',
    reg_s6_title: 'Votre participation',
    reg_s7_title: 'Vérification et confirmation',
    field_fullname: 'Nom complet',
    field_email: 'Adresse e-mail',
    field_phone: 'Numéro de téléphone',
    field_password: 'Créer un mot de passe',
    auth_login_title: 'Bon retour',
    auth_login_btn: 'Se connecter',
    val_required: 'Ce champ est obligatoire.',
    val_email: 'Veuillez entrer une adresse e-mail valide.',
    contact_send: 'Envoyer le message',
    dash_logout: 'Déconnexion',
    lang_switch_title: 'Langue',
    lang_switch_fallback: 'Changement rapide :',
    yes: 'Oui',
    no: 'Non',
    participant_home: 'Tableau de bord',
    participant_stage2: 'Étape 2 : Paiement et Hôtel',
    participant_status: 'Statut de candidature',
    participant_badge: 'Badge de Délégué',
    participant_profile: 'Mon Profil',
    participant_docs: 'Documents',
    participant_certs: 'Certificats',
    participant_app_status: 'Statut de la candidature',
    participant_payment: 'Statut du paiement',
    participant_hotel: 'Attribution d\'hôtel',
    participant_complete_stage2: 'Compléter l\'Étape 2',
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    download: 'Télécharger',
    upload: 'Téléverser',
    loading: 'Chargement...',
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté'
  };

  /* ---------- Arabic ---------- */
  DICT.ar = {
    lang_name: 'العربية',
    nav_register: 'التسجيل',
    nav_login: 'تسجيل الدخول',
    reg_welcome_title: 'مرحباً بكم في تسجيل القمة',
    reg_welcome_start: 'لنبدأ',
    reg_country_title: 'اختر بلدك',
    reg_country_search: 'ابحث عن بلدك...',
    reg_next: 'متابعة',
    reg_back: 'رجوع',
    reg_submit: 'تقديم الطلب',
    reg_s1_title: 'أخبرنا من أنت',
    reg_s2_title: 'بياناتك',
    reg_s3_title: 'كيف يمكننا التواصل معك؟',
    reg_s4_title: 'هويتك',
    field_fullname: 'الاسم الكامل',
    field_email: 'البريد الإلكتروني',
    field_phone: 'رقم الهاتف',
    field_password: 'إنشاء كلمة مرور',
    auth_login_title: 'مرحباً بعودتك',
    auth_login_btn: 'تسجيل الدخول',
    val_required: 'هذا الحقل مطلوب.',
    dash_logout: 'تسجيل الخروج',
    lang_switch_title: 'اللغة',
    lang_switch_fallback: 'تبديل سريع:',
    yes: 'نعم',
    no: 'لا',
    participant_home: 'لوحة القيادة',
    participant_stage2: 'المرحلة 2: الدفع والفندق',
    participant_status: 'حالة الطلب',
    participant_badge: 'شارة المندوب',
    participant_profile: 'ملفي الشخصي',
    participant_docs: 'المستندات',
    participant_certs: 'الشهادات',
    participant_app_status: 'حالة الطلب',
    participant_payment: 'حالة الدفع',
    participant_hotel: 'تخصيص الفندق',
    participant_complete_stage2: 'إكمال المرحلة 2',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    download: 'تحميل',
    upload: 'رفع',
    loading: 'جاري التحميل...',
    pending: 'قيد الانتظار',
    approved: 'تمت الموافقة',
    rejected: 'مرفوض'
  };

  /* ---------- Portuguese ---------- */
  DICT.pt = {
    lang_name: 'Português',
    nav_register: 'Registar',
    nav_login: 'Entrar',
    reg_welcome_title: 'Bem-vindo ao Registo da Cimeira',
    reg_welcome_start: 'Vamos Começar',
    reg_country_title: 'Selecione o seu país',
    reg_country_search: 'Procure o seu país...',
    reg_next: 'Continuar',
    reg_back: 'Voltar',
    reg_submit: 'Submeter Candidatura',
    field_fullname: 'Nome Completo',
    field_email: 'Endereço de E-mail',
    field_phone: 'Número de Telefone',
    auth_login_title: 'Bem-vindo de Volta',
    auth_login_btn: 'Entrar',
    val_required: 'Este campo é obrigatório.',
    dash_logout: 'Sair',
    lang_switch_title: 'Idioma',
    lang_switch_fallback: 'Troca rápida:',
    yes: 'Sim',
    no: 'Não',
    participant_home: 'Painel',
    participant_stage2: 'Etapa 2: Pagamento e Hotel',
    participant_status: 'Status da Candidatura',
    participant_badge: 'Crachá de Delegado',
    participant_profile: 'Meu Perfil',
    participant_docs: 'Documentos',
    participant_certs: 'Certificados',
    participant_app_status: 'Status da Candidatura',
    participant_payment: 'Status do Pagamento',
    participant_hotel: 'Atribuição de Hotel',
    participant_complete_stage2: 'Completar Etapa 2',
    save: 'Salvar',
    cancel: 'Cancelar',
    close: 'Fechar',
    download: 'Baixar',
    upload: 'Enviar',
    loading: 'Carregando...',
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado'
  };

  /* ---------- Amharic ---------- */
  DICT.am = {
    lang_name: 'አማርኛ',
    nav_register: 'ይመዝገቡ',
    nav_login: 'ይግቡ',
    reg_welcome_title: 'ወደ ጉባኤው ምዝገባ እንኳን በደህና መጡ',
    reg_welcome_start: 'እንጀምር',
    reg_country_title: 'አገርዎን ይምረጡ',
    reg_next: 'ቀጥል',
    reg_back: 'ተመለስ',
    field_fullname: 'ሙሉ ስም',
    field_email: 'ኢሜይል',
    auth_login_btn: 'ይግቡ',
    val_required: 'ይህ መስክ ያስፈልጋል።',
    dash_logout: 'ውጣ',
    lang_switch_title: 'ቋንቋ',
    yes: 'አዎ',
    no: 'አይ'
  };

  /* ---------- Kinyarwanda ---------- */
  DICT.rw = {
    lang_name: 'Kinyarwanda',
    nav_register: 'Kwiyandikisha',
    nav_login: 'Kwinjira',
    reg_welcome_title: 'Murakaza neza mu kwiyandikisha ku nama',
    reg_welcome_start: 'Reka Dutangire',
    reg_country_title: 'Hitamo igihugu cyawe',
    reg_next: 'Komeza',
    reg_back: 'Subira inyuma',
    field_fullname: 'Izina ryuzuye',
    field_email: 'Imeyili',
    val_required: 'Iki gice kirakenewe.',
    dash_logout: 'Sohoka',
    lang_switch_title: 'Ururimi',
    yes: 'Yego',
    no: 'Oya'
  };

  /* ---------- Kirundi ---------- */
  DICT.rn = {
    lang_name: 'Kirundi',
    nav_register: 'Kwiyandikisha',
    nav_login: 'Kwinjira',
    reg_welcome_title: 'Murakaze mu kwiyandikisha ku nama',
    reg_welcome_start: 'Reka Dutangure',
    reg_next: 'Komeza',
    reg_back: 'Subira inyuma',
    field_fullname: 'Izina ryuzuye',
    val_required: 'Iki gice kirakenewe.',
    dash_logout: 'Sohoka',
    lang_switch_title: 'Ururimi',
    yes: 'Ego',
    no: 'Oya'
  };

  /* ---------- Zulu ---------- */
  DICT.zu = {
    lang_name: 'isiZulu',
    nav_register: 'Bhalisa',
    nav_login: 'Ngena',
    reg_welcome_title: 'Siyakwamukela ekubhaliseni kweNgqungquthela',
    reg_welcome_start: 'Masiqale',
    reg_next: 'Qhubeka',
    reg_back: 'Buyela emuva',
    field_fullname: 'Igama Eliphelele',
    val_required: 'Lesi sigaba siyadingeka.',
    dash_logout: 'Phuma',
    lang_switch_title: 'Ulimi',
    yes: 'Yebo',
    no: 'Cha'
  };

  /* ---------- Xhosa ---------- */
  DICT.xh = {
    lang_name: 'isiXhosa',
    nav_register: 'Bhalisa',
    nav_login: 'Ngena',
    reg_welcome_title: 'Wamkelekile kubhaliso lwenkomfa',
    reg_welcome_start: 'Masiqale',
    reg_next: 'Qhubeka',
    reg_back: 'Buyela emva',
    field_fullname: 'Igama Elipheleleyo',
    val_required: 'Le ndawo iyafuneka.',
    dash_logout: 'Phuma',
    lang_switch_title: 'Ulwimi',
    yes: 'Ewe',
    no: 'Hayi'
  };

  /* ---------- Afrikaans ---------- */
  DICT.af = {
    lang_name: 'Afrikaans',
    nav_register: 'Registreer',
    nav_login: 'Teken In',
    reg_welcome_title: 'Welkom by die Beraad Registrasie',
    reg_welcome_start: 'Kom Ons Begin',
    reg_next: 'Gaan voort',
    reg_back: 'Terug',
    field_fullname: 'Volle Naam',
    field_email: 'E-posadres',
    val_required: 'Hierdie veld is verpligtend.',
    dash_logout: 'Teken Uit',
    lang_switch_title: 'Taal',
    yes: 'Ja',
    no: 'Nee'
  };

  /* ===== TRANSLATION ENGINE ===== */

  /**
   * Get a translation string by key.
   * Falls back to English if key not found in current language.
   */
  function t(key) {
    var dict = DICT[currentLang] || {};
    if (dict[key] !== undefined) return dict[key];
    /* Fallback to English */
    if (DICT.en[key] !== undefined) return DICT.en[key];
    return key;
  }

  /**
   * Translate all DOM elements with data-i18n attributes.
   */
  function translateDOM() {
    /* Text content */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    /* Placeholders */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key));
    });
    /* ARIA labels */
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', t(key));
    });
    /* Title attributes */
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', t(key));
    });

    /* Update the floating language switcher active state */
    updateFloatingSwitcher();
  }

  /**
   * Set the active language and re-translate the page.
   */
  function setLanguage(langCode) {
    if (!DICT[langCode] && langCode !== 'en') {
      /* Language not fully supported — fallback handling */
      langCode = 'en';
    }
    currentLang = langCode;
    document.documentElement.setAttribute('lang', langCode);
    /* Store preference */
    try { localStorage.setItem('isaac_lang', langCode); } catch (_e) { /* ignore */ }
    translateDOM();

    /* Handle RTL for Arabic (Disabled to maintain layout stability) */
    // if (langCode === 'ar') {
    //   document.documentElement.setAttribute('dir', 'rtl');
    // } else {
    //   document.documentElement.removeAttribute('dir');
    // }
  }

  /**
   * Get current language code
   */
  function getLanguage() {
    return currentLang;
  }

  /**
   * Get available languages list
   */
  function getAvailableLanguages() {
    return Object.keys(DICT).map(function (code) {
      return { code: code, name: DICT[code].lang_name || code };
    });
  }

  /**
   * Initialize: load saved language preference
   */
  function init() {
    try {
      var saved = localStorage.getItem('isaac_lang');
      if (saved && DICT[saved]) currentLang = saved;
    } catch (_e) { /* ignore */ }
    initFloatingLanguageSwitcher();
    translateDOM();
  }

  /* ===== FLOATING LANGUAGE SWITCHER ===== */
  /* Always shows English and Swahili quick-access buttons plus other languages */
  function initFloatingLanguageSwitcher() {
    if (document.querySelector('.lang-float')) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'lang-float';
    wrapper.setAttribute('role', 'navigation');
    wrapper.setAttribute('aria-label', 'Language selection');

    var menu = document.createElement('div');
    menu.className = 'lang-float-menu';
    menu.id = 'langFloatMenu';

    /* Always-visible fallback: English & Swahili */
    var heading = document.createElement('div');
    heading.className = 'lang-float-heading';
    heading.textContent = 'Quick switch:';
    heading.setAttribute('data-i18n', 'lang_switch_fallback');
    menu.appendChild(heading);

    /* English button */
    var enBtn = document.createElement('button');
    enBtn.className = 'lang-float-btn';
    enBtn.setAttribute('data-lang-code', 'en');
    enBtn.innerHTML = '🇬🇧 English';
    enBtn.addEventListener('click', function () { setLanguage('en'); });
    menu.appendChild(enBtn);

    /* Swahili button */
    var swBtn = document.createElement('button');
    swBtn.className = 'lang-float-btn';
    swBtn.setAttribute('data-lang-code', 'sw');
    swBtn.innerHTML = '🇰🇪 Kiswahili';
    swBtn.addEventListener('click', function () { setLanguage('sw'); });
    menu.appendChild(swBtn);

    /* Divider */
    var divider = document.createElement('div');
    divider.className = 'lang-float-divider';
    menu.appendChild(divider);

    /* Other languages heading */
    var otherHeading = document.createElement('div');
    otherHeading.className = 'lang-float-heading';
    otherHeading.textContent = 'More languages:';
    menu.appendChild(otherHeading);

    /* Other languages */
    var otherLangs = [
      { code: 'fr', flag: '🇫🇷', name: 'Français' },
      { code: 'ar', flag: '🇸🇦', name: 'العربية' },
      { code: 'pt', flag: '🇵🇹', name: 'Português' },
      { code: 'am', flag: '🇪🇹', name: 'አማርኛ' },
      { code: 'rw', flag: '🇷🇼', name: 'Kinyarwanda' },
      { code: 'rn', flag: '🇧🇮', name: 'Kirundi' },
      { code: 'zu', flag: '🇿🇦', name: 'isiZulu' },
      { code: 'xh', flag: '🇿🇦', name: 'isiXhosa' },
      { code: 'af', flag: '🇿🇦', name: 'Afrikaans' }
    ];

    otherLangs.forEach(function (lang) {
      var btn = document.createElement('button');
      btn.className = 'lang-float-btn';
      btn.setAttribute('data-lang-code', lang.code);
      btn.innerHTML = lang.flag + ' ' + lang.name;
      btn.addEventListener('click', function () { setLanguage(lang.code); });
      menu.appendChild(btn);
    });

    wrapper.appendChild(menu);

    /* Toggle button (globe icon) */
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'lang-float-toggle';
    toggleBtn.innerHTML = '<i class="bi bi-translate"></i>';
    toggleBtn.setAttribute('aria-label', 'Change language');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    wrapper.appendChild(toggleBtn);
    document.body.appendChild(wrapper);

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) {
        menu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Update active state in floating switcher
   */
  function updateFloatingSwitcher() {
    var buttons = document.querySelectorAll('.lang-float-btn');
    buttons.forEach(function (btn) {
      if (btn.getAttribute('data-lang-code') === currentLang) {
        btn.classList.add('active-lang');
      } else {
        btn.classList.remove('active-lang');
      }
    });
    /* Update the heading text */
    var heading = document.querySelector('.lang-float-heading[data-i18n]');
    if (heading) heading.textContent = t('lang_switch_fallback');
  }

  /* ===== EXPOSE GLOBALLY ===== */
  window.Translate = {
    t: t,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    getAvailableLanguages: getAvailableLanguages,
    translateDOM: translateDOM,
    init: init
  };

  /* Auto-init when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
