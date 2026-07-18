UPDATE public.recipes SET image_url = CASE id
  WHEN '4242057f-a8a7-4c89-babf-6e5935b6de55'::uuid THEN '/__l5e/assets-v1/2fceb7ab-5ff2-4309-9f97-4f434044884e/acharuli-khachapuri.jpg'
  WHEN '4712f817-588d-4aa7-b13a-9bfe34c879ca'::uuid THEN '/__l5e/assets-v1/ee7e2ef4-35d2-4aae-846b-8fd0313b0829/green-tkemali.jpg'
  WHEN '2bd3987e-274d-4ec2-a5ca-54b1ca59cad7'::uuid THEN '/__l5e/assets-v1/c73ead94-36b3-4ed9-bf22-49f17d17e8e7/spinach-pkhali.jpeg'
  WHEN 'b7df5790-e393-4bbd-a5fa-292c031a5198'::uuid THEN '/__l5e/assets-v1/27f5b560-466c-4d5b-8228-c0e6bea126a9/khinkali.jpg'
  WHEN 'f5ecf60a-ac3e-49e9-bc2d-87f28497cf2a'::uuid THEN '/__l5e/assets-v1/44ebeb7a-8519-414f-b074-5b2cc76120fa/lobio-pot.webp'
  WHEN 'aa74de44-a36f-42a0-b66b-c2bd4d80bf08'::uuid THEN '/__l5e/assets-v1/36465338-ea20-45c7-934d-fae355e78c8c/walnut-eggplant.jpg'
  WHEN '741e66fd-8191-49f1-9a94-b19b62c6db85'::uuid THEN '/__l5e/assets-v1/2f0f4f44-f522-432a-bd7d-b71cb3621860/churchkhela-walnut.jpeg'
  WHEN '01e8888b-6c4c-4305-a4c1-4eab2c1dd1ef'::uuid THEN '/__l5e/assets-v1/e16b91c5-d677-479d-b70f-eab0470be101/pelamushi.webp'
  ELSE image_url
END,
title = CASE
  WHEN id = 'b7df5790-e393-4bbd-a5fa-292c031a5198'::uuid THEN 'ხინკალი'
  ELSE title
END,
updated_at = now()
WHERE id IN (
  '4242057f-a8a7-4c89-babf-6e5935b6de55'::uuid,
  '4712f817-588d-4aa7-b13a-9bfe34c879ca'::uuid,
  '2bd3987e-274d-4ec2-a5ca-54b1ca59cad7'::uuid,
  'b7df5790-e393-4bbd-a5fa-292c031a5198'::uuid,
  'f5ecf60a-ac3e-49e9-bc2d-87f28497cf2a'::uuid,
  'aa74de44-a36f-42a0-b66b-c2bd4d80bf08'::uuid,
  '741e66fd-8191-49f1-9a94-b19b62c6db85'::uuid,
  '01e8888b-6c4c-4305-a4c1-4eab2c1dd1ef'::uuid
);