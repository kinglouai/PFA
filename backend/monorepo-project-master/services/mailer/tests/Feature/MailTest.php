<?php

namespace Tests\Feature;

use Tests\TestCase;

class MailTest extends TestCase
{
    public function test_health_returns_ok(): void
    {
        $response = $this->get('/api/health');
        $response->assertStatus(200);
        $response->assertJson(['status' => 'ok', 'service' => 'mailer']);
    }

    public function test_send_requires_fields(): void
    {
        $response = $this->postJson('/api/send', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['to', 'subject', 'body']);
    }

    public function test_send_valid_email(): void
    {
        $response = $this->postJson('/api/send', [
            'to'      => 'user@example.com',
            'subject' => 'Welcome',
            'body'    => 'Hello from the mailer service!',
        ]);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }
}
